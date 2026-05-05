import { NextResponse } from 'next/server';
import { getTurso } from '@/lib/turso';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

// Ensure email column exists (safe migration)
async function ensureEmailColumn() {
  try {
    await getTurso().execute("ALTER TABLE customers ADD COLUMN email TEXT");
    console.log('Added email column to customers table');
  } catch {
    // Column already exists, ignore
  }
}

// Run migration on first request
let migrationRan = false;
async function runMigration() {
  if (!migrationRan) {
    await ensureEmailColumn();
    migrationRan = true;
  }
}

export async function POST(request: Request) {
  try {
    await runMigration();
    const body = await request.json();
    const { type, mobile, pin, first_name, last_name, email, user_id, password, code } = body;

    if (type === 'customer-login') {
      if (!mobile || !pin) {
        return NextResponse.json({ error: 'Mobile number and password are required' }, { status: 400 });
      }
      const result = await getTurso().execute({
        sql: 'SELECT * FROM customers WHERE mobile = ? AND pin = ?',
        args: [mobile, pin],
      });
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid mobile number or password' }, { status: 401 });
      }
      const c = result.rows[0];
      return NextResponse.json({
        customer: {
          id: c.id, first_name: c.first_name, last_name: c.last_name, mobile: c.mobile,
          email: c.email, avatar: c.avatar, address: c.address, pincode: c.pincode,
          nearby_area: c.nearby_area, total_orders: Number(c.total_orders), total_spent: Number(c.total_spent),
        },
      });
    }

    if (type === 'customer-signup') {
      if (!first_name || !mobile || !pin) {
        return NextResponse.json({ error: 'First name, mobile and password are required' }, { status: 400 });
      }
      const existing = await getTurso().execute({ sql: 'SELECT id FROM customers WHERE mobile = ?', args: [mobile] });
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'This mobile number is already registered. Please login instead.' }, { status: 400 });
      }
      const id = randomUUID();
      await getTurso().execute({
        sql: 'INSERT INTO customers (id, first_name, last_name, mobile, pin, email) VALUES (?, ?, ?, ?, ?, ?)',
        args: [id, first_name, last_name || '', mobile, pin, email || null],
      });
      return NextResponse.json({
        customer: {
          id, first_name, last_name: last_name || '', mobile, email: email || null,
          avatar: null, address: null, pincode: null, nearby_area: null, total_orders: 0, total_spent: 0,
        },
      });
    }

    if (type === 'customer-update') {
      const { customer_id, data } = body;
      if (!customer_id) {
        return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
      }
      // Update profile fields
      const updates: string[] = [];
      const values: unknown[] = [];
      if (data.first_name !== undefined) { updates.push('first_name = ?'); values.push(data.first_name); }
      if (data.last_name !== undefined) { updates.push('last_name = ?'); values.push(data.last_name); }
      if (data.email !== undefined) { updates.push('email = ?'); values.push(data.email); }
      if (data.address !== undefined) { updates.push('address = ?'); values.push(data.address); }
      if (data.pincode !== undefined) { updates.push('pincode = ?'); values.push(data.pincode); }
      if (data.nearby_area !== undefined) { updates.push('nearby_area = ?'); values.push(data.nearby_area); }
      if (data.avatar !== undefined) { updates.push('avatar = ?'); values.push(data.avatar); }
      if (updates.length === 0) {
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
      }
      values.push(customer_id);
      await getTurso().execute({
        sql: `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
        args: values,
      });
      const result = await getTurso().execute({ sql: 'SELECT * FROM customers WHERE id = ?', args: [customer_id] });
      const c = result.rows[0];
      return NextResponse.json({
        customer: {
          id: c.id, first_name: c.first_name, last_name: c.last_name, mobile: c.mobile,
          email: c.email, avatar: c.avatar, address: c.address, pincode: c.pincode,
          nearby_area: c.nearby_area, total_orders: Number(c.total_orders), total_spent: Number(c.total_spent),
        },
      });
    }

    if (type === 'admin-login') {
      const result = await getTurso().execute({
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
      const result = await getTurso().execute({
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
