import { NextResponse } from 'next/server';
import { getTurso } from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getTurso().execute('SELECT * FROM shop_settings WHERE id = ?', ['main']);
    return NextResponse.json(result.rows[0] || {});
  } catch (error) {
    console.error('Shop settings error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { shop_name, gst_no, shop_phone, owner_name, address, terms, logo } = body;

    await getTurso().execute({
      sql: "UPDATE shop_settings SET shop_name=?, gst_no=?, shop_phone=?, owner_name=?, address=?, terms=?, logo=?, updated_at=datetime('now') WHERE id='main'",
      args: [shop_name, gst_no, shop_phone, owner_name, address, terms, logo],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Shop settings update error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
