import { NextResponse } from 'next/server';
import { getTurso } from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [settingsResult, statsResult, topProducts, topCategories] = await Promise.all([
      getTurso().execute('SELECT * FROM shop_settings WHERE id = ?', ['main']),
      getTurso().execute(`SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(DISTINCT customer_id) as total_customers,
        COALESCE(SUM(CASE WHEN status = 'Delivered' THEN total ELSE 0 END), 0) as total_profit
      FROM orders`),
      getTurso().execute(`SELECT oi.product_name, SUM(oi.quantity) as sold, SUM(oi.price * oi.quantity) as revenue
        FROM order_items oi GROUP BY oi.product_id ORDER BY sold DESC LIMIT 5`),
      getTurso().execute(`SELECT c.name, c.product_count, COUNT(oi.id) as sold
        FROM categories c LEFT JOIN products p ON c.id = p.category_id 
        LEFT JOIN order_items oi ON p.id = oi.product_id 
        GROUP BY c.id ORDER BY sold DESC LIMIT 5`),
    ]);

    const revenueByMonth = await getTurso().execute(`
      SELECT strftime('%Y-%m', created_at) as month, SUM(total) as revenue, COUNT(*) as orders
      FROM orders GROUP BY month ORDER BY month DESC LIMIT 6
    `);

    const ordersByWeek = await getTurso().execute(`
      SELECT strftime('%W', created_at) as week, COUNT(*) as orders
      FROM orders WHERE created_at >= datetime('now', '-35 days')
      GROUP BY week ORDER BY week
    `);

    return NextResponse.json({
      settings: settingsResult.rows[0] || {},
      stats: statsResult.rows[0],
      topProducts: topProducts.rows,
      topCategories: topCategories.rows,
      revenueByMonth: revenueByMonth.rows,
      ordersByWeek: ordersByWeek.rows,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
