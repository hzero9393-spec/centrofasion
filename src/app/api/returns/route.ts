import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id');

    let where = '';
    const params: string[] = [];
    if (customer_id) { where = 'WHERE customer_id = ?'; params.push(customer_id); }

    const result = await turso.execute({ sql: `SELECT * FROM returns ${where} ORDER BY created_at DESC`, args: params });
    const returns = result.rows.map((row) => ({
      id: row.id, order_id: row.order_id, customer_id: row.customer_id,
      product_id: row.product_id, product_name: row.product_name,
      reason: row.reason, status: row.status, created_at: row.created_at,
    }));
    return NextResponse.json(returns);
  } catch (error) {
    console.error('Returns error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, customer_id, product_id, product_name, reason } = body;

    await turso.execute({
      sql: 'INSERT INTO returns (id, order_id, customer_id, product_id, product_name, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [randomUUID(), order_id, customer_id, product_id, product_name, reason, 'Pending'],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Returns POST error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    await turso.execute({
      sql: "UPDATE returns SET status = ?, updated_at = datetime('now') WHERE id = ?",
      args: [status, id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Returns PUT error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
