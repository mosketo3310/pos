import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import db, { initDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  await initDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  const result = category
    ? await db.execute({
        sql: 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.user_id = ? AND p.category_id = ? ORDER BY p.name',
        args: [session.user.id, category],
      })
    : await db.execute({
        sql: 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.user_id = ? ORDER BY p.name',
        args: [session.user.id],
      });

  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  await initDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, price, stock, category_id, image_url, barcode } = await req.json();
  const result = await db.execute({
    sql: 'INSERT INTO products (user_id, name, price, stock, category_id, image_url, barcode) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [session.user.id, name, price, stock ?? 0, category_id ?? null, image_url ?? null, barcode ?? null],
  });
  return NextResponse.json({ id: Number(result.lastInsertRowid) });
}

export async function PUT(req: NextRequest) {
  await initDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, name, price, stock, category_id, image_url, barcode } = await req.json();
  await db.execute({
    sql: 'UPDATE products SET name=?, price=?, stock=?, category_id=?, image_url=?, barcode=? WHERE id=? AND user_id=?',
    args: [name, price, stock, category_id ?? null, image_url ?? null, barcode ?? null, id, session.user.id],
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  await initDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await db.execute({ sql: 'DELETE FROM products WHERE id=? AND user_id=?', args: [id, session.user.id] });
  return NextResponse.json({ ok: true });
}