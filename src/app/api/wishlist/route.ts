import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id');
    const product_id = searchParams.get('product_id');

    let where = 'WHERE 1=1';
    const params: string[] = [];
    if (customer_id) { where += ' AND customer_id = ?'; params.push(customer_id); }
    if (product_id) { where += ' AND product_id = ?'; params.push(product_id); }

    const result = await turso.execute({ sql: `SELECT w.*, p.name, p.price, p.images FROM wishlist w LEFT JOIN products p ON w.product_id = p.id ${where}`, args: params });
    
    const wishlist = result.rows.map((row) => {
      const images = JSON.parse((row.images as string) || '[]');
      return {
        id: row.id, customer_id: row.customer_id, product_id: row.product_id,
        name: row.name, price: Number(row.price), image: images[0] || '', created_at: row.created_at,
      };
    });
    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Wishlist error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_id, product_id } = body;
    const { randomUUID } = await import('crypto');

    await turso.execute({
      sql: 'INSERT OR IGNORE INTO wishlist (id, customer_id, product_id) VALUES (?, ?, ?)',
      args: [randomUUID(), customer_id, product_id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const customer_id = searchParams.get('customer_id');
    const product_id = searchParams.get('product_id');

    if (id) {
      await turso.execute({ sql: 'DELETE FROM wishlist WHERE id = ?', args: [id!] });
    } else if (customer_id && product_id) {
      await turso.execute({ sql: 'DELETE FROM wishlist WHERE customer_id = ? AND product_id = ?', args: [customer_id, product_id] });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishlist DELETE error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
