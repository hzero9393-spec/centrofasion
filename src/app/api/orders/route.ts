import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id');
    const status = searchParams.get('status');
    const period = searchParams.get('period');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (customer_id) { where += ' AND o.customer_id = ?'; params.push(customer_id); }
    if (status) { where += ' AND o.status = ?'; params.push(status); }
    if (period === 'today') { where += ' AND date(o.created_at) = date("now")'; }
    if (period === 'week') { where += ' AND o.created_at >= datetime("now", "-7 days")'; }
    if (period === 'month') { where += ' AND o.created_at >= datetime("now", "-30 days")'; }

    const countResult = await turso.execute({ sql: `SELECT COUNT(*) as total FROM orders o ${where}`, args: params });
    const total = Number(countResult.rows[0].total);

    const result = await turso.execute({
      sql: `SELECT o.*, c.first_name, c.last_name, c.mobile as customer_mobile 
            FROM orders o LEFT JOIN customers c ON o.customer_id = c.id 
            ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      args: [...params, limit, offset],
    });

    const orders = result.rows.map((row) => ({
      id: row.id,
      order_number: row.order_number,
      customer_id: row.customer_id,
      customer_name: `${row.first_name} ${row.last_name || ''}`.trim(),
      customer_mobile: row.customer_mobile,
      status: row.status,
      total: Number(row.total),
      address: row.address,
      pincode: row.pincode,
      payment_method: row.payment_method,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_id, items, address, pincode, payment_method, total } = body;
    const { randomUUID } = await import('crypto');

    // Generate order number
    const countResult = await turso.execute('SELECT COUNT(*) as c FROM orders');
    const orderNumber = `CF${String(1001 + Number(countResult.rows[0].c))}`;

    const orderId = randomUUID();

    await turso.execute({
      sql: `INSERT INTO orders (id, order_number, customer_id, status, total, address, pincode, payment_method)
            VALUES (?, ?, ?, 'Pending', ?, ?, ?, ?)`,
      args: [orderId, orderNumber, customer_id, total, address, pincode, payment_method || 'COD'],
    });

    for (const item of items) {
      await turso.execute({
        sql: `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, size, color, quantity, price)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [randomUUID(), orderId, item.product_id, item.name, item.image, item.size, item.color, item.quantity, item.price],
      });

      // Decrease stock
      await turso.execute({
        sql: 'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        args: [item.quantity, item.product_id, item.quantity],
      });
    }

    // Update customer stats
    await turso.execute({
      sql: `UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ?,
            importance = CASE WHEN total_spent + ? > 10000 THEN 'High' WHEN total_spent + ? > 5000 THEN 'Medium' ELSE 'Low' END
            WHERE id = ?`,
      args: [total, total, total, customer_id],
    });

    return NextResponse.json({ success: true, order_number: orderNumber, id: orderId });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    await turso.execute({
      sql: `UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      args: [status, id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Orders PUT error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
