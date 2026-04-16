import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import db, { initDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  await initDB();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { items, payment_method, received } = await req.json();
  
  // ป้องกัน items เป็น undefined
  const safeItems = items || [];
  const total = safeItems.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0);
  const change = payment_method === 'cash' ? (received - total) : null;

  try {
    // ใช้ RETURNING id เพื่อให้ได้ ID ที่แน่นอนจาก Database
    const saleResult = await db.execute({
      sql: 'INSERT INTO sales (user_id, total, payment_method, received, change) VALUES (?,?,?,?,?) RETURNING id',
      args: [(session.user as any).id, total, payment_method, received ?? null, change],
    });
    
    const saleId = saleResult.rows[0]?.id;

    if (!saleId) throw new Error("Failed to get Sale ID");

    // ใช้ for...of ปกติ แต่เช็คความปลอดภัยข้อมูล
    for (const item of safeItems) {
      await db.execute({
        sql: 'INSERT INTO sale_items (sale_id, product_id, name, price, qty) VALUES (?,?,?,?,?)',
        args: [saleId, item.product_id, item.name, item.price, item.qty],
      });
      await db.execute({
        sql: 'UPDATE products SET stock = stock - ? WHERE id = ? AND user_id = ?',
        args: [item.qty, item.product_id, (session.user as any).id],
      });
    }

    return NextResponse.json({
      saleId,
      total,
      payment_method,
      received: received ?? null,
      change,
      shopName: (session.user as any).shopName ?? session.user.name ?? 'ร้านค้า',
      items: safeItems.map((i: any) => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
      })),
    });
  } catch (error: any) {
    console.error("SALE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await initDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const saleRes = await db.execute({
      sql: 'SELECT * FROM sales WHERE id = ? AND user_id = ?',
      args: [id, session.user.id],
    });
    const itemsRes = await db.execute({
      sql: 'SELECT * FROM sale_items WHERE sale_id = ?',
      args: [id],
    });
    return NextResponse.json({ ...saleRes.rows[0], items: itemsRes.rows });
  }

  const result = await db.execute({
    sql: `SELECT s.id, s.total, s.payment_method, s.received, s.change, s.created_at,
          COUNT(si.id) as item_count,
          GROUP_CONCAT(si.name || ' x' || si.qty) as items_summary
          FROM sales s
          LEFT JOIN sale_items si ON si.sale_id = s.id
          WHERE s.user_id = ?
          GROUP BY s.id ORDER BY s.created_at DESC LIMIT 200`,
    args: [session.user.id],
  });
  return NextResponse.json(result.rows);
}

export async function DELETE(req: NextRequest) {
  await initDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await db.execute({ sql: 'DELETE FROM sale_items WHERE sale_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM sales WHERE id = ? AND user_id = ?', args: [id, session.user.id] });
  return NextResponse.json({ ok: true });
}