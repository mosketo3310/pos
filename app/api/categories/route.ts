import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import db, { initDB } from '@/lib/db';

export async function GET() {
  await initDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await db.execute({
    sql: 'SELECT * FROM categories WHERE user_id = ? ORDER BY name',
    args: [session.user.id],
  });
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  await initDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  const result = await db.execute({
    sql: 'INSERT INTO categories (user_id, name) VALUES (?, ?)',
    args: [session.user.id, name],
  });
  return NextResponse.json({ id: Number(result.lastInsertRowid), name });
}

export async function DELETE(req: NextRequest) {
  await initDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await db.execute({ sql: 'DELETE FROM categories WHERE id=? AND user_id=?', args: [id, session.user.id] });
  return NextResponse.json({ ok: true });
}