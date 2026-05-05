import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await turso.execute('SELECT * FROM categories ORDER BY name ASC');
    const categories = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      image: row.image,
      product_count: Number(row.product_count),
    }));
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, image } = body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { randomUUID } = await import('crypto');

    await turso.execute({
      sql: 'INSERT INTO categories (id, name, slug, image) VALUES (?, ?, ?, ?)',
      args: [randomUUID(), name, slug, image],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, image } = body;
    await turso.execute({
      sql: 'UPDATE categories SET name=?, image=?, updated_at=datetime("now") WHERE id=?',
      args: [name, image, id],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Categories PUT error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await turso.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id!] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Categories DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
