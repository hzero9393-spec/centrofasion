import { NextResponse } from 'next/server';
import { getTurso } from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');

    if (order_id) {
      const order = await getTurso().execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [order_id] });
      if (!order.rows[0]) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      const items = await getTurso().execute({ sql: 'SELECT * FROM order_items WHERE order_id = ?', args: [order_id] });
      const customer = await getTurso().execute({ sql: 'SELECT * FROM customers WHERE id = ?', args: [order.rows[0].customer_id as string] });

      return NextResponse.json({
        order: order.rows[0],
        items: items.rows,
        customer: customer.rows[0],
      });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
