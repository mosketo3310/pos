import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import db, { initDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  await initDB();
  const { email, password, shop_name } = await req.json();
  if (!email || !password || !shop_name)
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });

  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0)
    return NextResponse.json({ error: 'อีเมลนี้ถูกใช้แล้ว' }, { status: 400 });

  const password_hash = await bcrypt.hash(password, 10);
  const id = randomUUID();
  await db.execute({
    sql: 'INSERT INTO users (id, email, password_hash, shop_name) VALUES (?, ?, ?, ?)',
    args: [id, email, password_hash, shop_name],
  });
  return NextResponse.json({ ok: true });
}