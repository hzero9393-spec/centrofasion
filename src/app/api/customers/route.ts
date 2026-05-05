import { NextResponse } from 'next/server';
import { getTurso } from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const result = await getTurso().execute({ sql: 'SELECT * FROM customers WHERE id = ?', args: [id] });
      if (!result.rows[0]) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      
      const orders = await getTurso().execute({ sql: 'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC', args: [id] });
      const c = result.rows[0];
      return NextResponse.json({
        customer: {
          id: c.id, first_name: c.first_name, last_name: c.last_name, mobile: c.mobile,
          avatar: c.avatar, address: c.address, pincode: c.pincode, nearby_area: c.nearby_area,
          total_orders: Number(c.total_orders), total_spent: Number(c.total_spent),
          importance: c.importance, created_at: c.created_at,
        },
        orders: orders.rows,
      });
    }

    const result = await getTurso().execute('SELECT * FROM customers ORDER BY created_at DESC');
    const customers = result.rows.map((row) => ({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      mobile: row.mobile,
      avatar: row.avatar,
      address: row.address,
      pincode: row.pincode,
      total_orders: Number(row.total_orders),
      total_spent: Number(row.total_spent),
      importance: row.importance,
      created_at: row.created_at,
    }));
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Customers error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, first_name, last_name, address, pincode, nearby_area, avatar, pin: newPin } = body;

    const updates: string[] = [];
    const params: (string | null)[] = [];

    if (first_name !== undefined) { updates.push('first_name = ?'); params.push(first_name); }
    if (last_name !== undefined) { updates.push('last_name = ?'); params.push(last_name); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (pincode !== undefined) { updates.push('pincode = ?'); params.push(pincode); }
    if (nearby_area !== undefined) { updates.push('nearby_area = ?'); params.push(nearby_area); }
    if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
    if (newPin) { updates.push('pin = ?'); params.push(newPin); }

    updates.push("updated_at = datetime('now')");
    params.push(id);

    await getTurso().execute({
      sql: `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
      args: params,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
