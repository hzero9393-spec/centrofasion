import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, mobile, pin, first_name, last_name, user_id, password, code } = body;

    if (type === 'customer-login') {
      const result = await turso.execute({
        sql: 'SELECT * FROM customers WHERE mobile = ? AND pin = ?',
        args: [mobile, pin],
      });
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const c = result.rows[0];
      return NextResponse.json({
        customer: { id: c.id, first_name: c.first_name, last_name: c.last_name, mobile: c.mobile, avatar: c.avatar, address: c.address, pincode: c.pincode, nearby_area: c.nearby_area, total_orders: Number(c.total_orders), total_spent: Number(c.total_spent) },
      });
    }

    if (type === 'customer-signup') {
      const existing = await turso.execute({ sql: 'SELECT id FROM customers WHERE mobile = ?', args: [mobile] });
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Mobile already registered' }, { status: 400 });
      }
      const id = randomUUID();
      await turso.execute({
        sql: 'INSERT INTO customers (id, first_name, last_name, mobile, pin) VALUES (?, ?, ?, ?, ?)',
        args: [id, first_name, last_name || '', mobile, pin],
      });
      return NextResponse.json({
        customer: { id, first_name, last_name: last_name || '', mobile, avatar: null, address: null, pincode: null, nearby_area: null, total_orders: 0, total_spent: 0 },
      });
    }

    if (type === 'admin-login') {
      const result = await turso.execute({
        sql: 'SELECT * FROM admins WHERE (user_id = ? OR name LIKE ?) AND password = ?',
        args: [user_id, `%${user_id}%`, password],
      });
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const a = result.rows[0];
      return NextResponse.json({
        admin: { id: a.id, user_id: a.user_id, name: a.name, last_name: a.last_name, phone: a.phone, avatar: a.avatar, is_master: Number(a.is_master) },
      });
    }

    if (type === 'admin-code-login') {
      const result = await turso.execute({
        sql: 'SELECT * FROM admins WHERE code = ?',
        args: [code],
      });
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
      }
      const a = result.rows[0];
      return NextResponse.json({
        admin: { id: a.id, user_id: a.user_id, name: a.name, last_name: a.last_name, phone: a.phone, avatar: a.avatar, is_master: Number(a.is_master) },
      });
    }

    return NextResponse.json({ error: 'Invalid auth type' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
