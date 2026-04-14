import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import db, { initDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  await initDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const uid = session.user.id;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const rangeFilter = from && to
    ? `AND date(created_at,'unixepoch','localtime') BETWEEN '${from}' AND '${to}'`
    : `AND created_at >= unixepoch('now','-30 days')`;

  const rangeFilterS = from && to
    ? `AND date(s.created_at,'unixepoch','localtime') BETWEEN '${from}' AND '${to}'`
    : `AND s.created_at >= unixepoch('now','-30 days')`;

  const [dailySales, salesDetail, lowStock, todayTotal] = await Promise.all([
    db.execute({
      sql: `SELECT date(created_at,'unixepoch','localtime') as day,
            SUM(total) as revenue, COUNT(*) as bill_count,
            SUM(CASE WHEN payment_method='cash' THEN total ELSE 0 END) as cash_total,
            SUM(CASE WHEN payment_method='transfer' THEN total ELSE 0 END) as transfer_total,
            SUM(CASE WHEN payment_method='cash' THEN COALESCE(change,0) ELSE 0 END) as change_total
            FROM sales WHERE user_id = ? ${rangeFilter}
            GROUP BY day ORDER BY day`,
      args: [uid],
    }),
    db.execute({
      sql: `SELECT s.id, s.total, s.payment_method, s.received, s.change, s.created_at,
            si.name as item_name, si.qty, si.price
            FROM sales s JOIN sale_items si ON si.sale_id = s.id
            WHERE s.user_id = ? ${rangeFilterS}
            ORDER BY s.created_at DESC`,
      args: [uid],
    }),
    db.execute({
      sql: 'SELECT id, name, stock FROM products WHERE user_id = ? AND stock < 20 ORDER BY stock ASC',
      args: [uid],
    }),
    db.execute({
      sql: `SELECT COALESCE(SUM(total),0) as total, COUNT(*) as bills,
            COALESCE(SUM(CASE WHEN payment_method='cash' THEN total ELSE 0 END),0) as cash_total,
            COALESCE(SUM(CASE WHEN payment_method='transfer' THEN total ELSE 0 END),0) as transfer_total,
            COALESCE(SUM(CASE WHEN payment_method='cash' THEN COALESCE(change,0) ELSE 0 END),0) as change_total
            FROM sales WHERE user_id = ?
            AND date(created_at,'unixepoch','localtime') = date('now','localtime')`,
      args: [uid],
    }),
  ]);

  return NextResponse.json({
    dailySales: dailySales.rows,
    salesDetail: salesDetail.rows,
    lowStock: lowStock.rows,
    todayTotal: todayTotal.rows[0],
  });
}