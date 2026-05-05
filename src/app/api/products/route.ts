import { NextResponse } from 'next/server';
import { getTurso } from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let where = '';
    const params: (string | number)[] = [];

    if (category) {
      where += ' AND c.slug = ?';
      params.push(category);
    }
    if (search) {
      where += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }
    if (featured === 'true') {
      where += ' AND p.featured = 1';
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price-low') orderBy = 'p.price ASC';
    if (sort === 'price-high') orderBy = 'p.price DESC';
    if (sort === 'name') orderBy = 'p.name ASC';

    const countResult = await getTurso().execute({
      sql: `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1${where}`,
      args: params,
    });
    const total = Number(countResult.rows[0].total);

    const result = await getTurso().execute({
      sql: `SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p LEFT JOIN categories c ON p.category_id = c.id 
            WHERE 1=1${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      args: [...params, limit, offset],
    });

    const products = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: Number(row.price),
      wholesale_price: row.wholesale_price ? Number(row.wholesale_price) : null,
      stock: Number(row.stock),
      sizes: JSON.parse(row.sizes as string),
      colors: JSON.parse(row.colors as string),
      images: JSON.parse(row.images as string),
      category_id: row.category_id,
      category_name: row.category_name,
      category_slug: row.category_slug,
      featured: Number(row.featured) === 1,
      created_at: row.created_at,
    }));

    return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, wholesale_price, stock, sizes, colors, images, category_id, featured } = body;

    const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const { randomUUID } = await import('crypto');

    const result = await getTurso().execute({
      sql: `INSERT INTO products (id, name, slug, description, price, wholesale_price, stock, sizes, colors, images, category_id, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [randomUUID(), name, slug, description, price, wholesale_price, stock, JSON.stringify(sizes), JSON.stringify(colors), JSON.stringify(images), category_id || null, featured ? 1 : 0],
    });

    // Update category count
    if (category_id) {
      await getTurso().execute({
        sql: 'UPDATE categories SET product_count = (SELECT COUNT(*) FROM products WHERE category_id = ?) WHERE id = ?',
        args: [category_id, category_id],
      });
    }

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, price, wholesale_price, stock, sizes, colors, images, category_id, featured } = body;

    await getTurso().execute({
      sql: `UPDATE products SET name=?, description=?, price=?, wholesale_price=?, stock=?, sizes=?, colors=?, images=?, category_id=?, featured=?, updated_at=datetime('now')
            WHERE id=?`,
      args: [name, description, price, wholesale_price, stock, JSON.stringify(sizes), JSON.stringify(colors), JSON.stringify(images), category_id || null, featured ? 1 : 0, id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Products PUT error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const product = await getTurso().execute({ sql: 'SELECT category_id FROM products WHERE id = ?', args: [id!] });
    if (product.rows[0]?.category_id) {
      await getTurso().execute({
        sql: 'UPDATE categories SET product_count = (SELECT COUNT(*) FROM products WHERE category_id = ?) WHERE id = ?',
        args: [product.rows[0].category_id, product.rows[0].category_id],
      });
    }

    await getTurso().execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id!] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Products DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
