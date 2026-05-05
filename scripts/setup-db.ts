import { turso } from '../src/lib/turso';
import { randomUUID } from 'crypto';

async function setupDatabase() {
  console.log('Setting up ClothFasion database...');

  await turso.execute(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, image TEXT,
    product_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT,
    price REAL NOT NULL DEFAULT 0, wholesale_price REAL, stock INTEGER DEFAULT 0,
    sizes TEXT DEFAULT '[]', colors TEXT DEFAULT '[]', images TEXT DEFAULT '[]',
    category_id TEXT, featured INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT, mobile TEXT NOT NULL UNIQUE,
    pin TEXT NOT NULL, avatar TEXT, address TEXT, pincode TEXT, nearby_area TEXT,
    total_orders INTEGER DEFAULT 0, total_spent REAL DEFAULT 0, importance TEXT DEFAULT 'Low',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, order_number TEXT NOT NULL UNIQUE, customer_id TEXT NOT NULL,
    status TEXT DEFAULT 'Pending', total REAL NOT NULL DEFAULT 0, address TEXT, pincode TEXT,
    payment_method TEXT DEFAULT 'COD', notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY, order_id TEXT NOT NULL, product_id TEXT NOT NULL,
    product_name TEXT NOT NULL, product_image TEXT, size TEXT, color TEXT,
    quantity INTEGER DEFAULT 1, price REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS wishlist (
    id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, product_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(customer_id, product_id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS returns (
    id TEXT PRIMARY KEY, order_id TEXT NOT NULL, customer_id TEXT NOT NULL,
    product_id TEXT NOT NULL, product_name TEXT, reason TEXT, status TEXT DEFAULT 'Pending',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL, last_name TEXT,
    phone TEXT, password TEXT NOT NULL, code TEXT, avatar TEXT, is_master INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS shop_settings (
    id TEXT PRIMARY KEY, shop_name TEXT DEFAULT 'ClothFasion', gst_no TEXT, shop_phone TEXT,
    owner_name TEXT, address TEXT, terms TEXT, logo TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  await turso.execute(`CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, colors TEXT DEFAULT '[]',
    is_active INTEGER DEFAULT 0, for_admin INTEGER DEFAULT 0
  )`);

  console.log('All tables created successfully!');

  // Seed categories
  const existingCats = await turso.execute('SELECT COUNT(*) as c FROM categories');
  if (Number(existingCats.rows[0].c) === 0) {
    await turso.execute({ sql: "INSERT INTO categories (id, name, slug, image) VALUES (?, 'Men', 'men', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=400&fit=crop')", args: [randomUUID()] });
    await turso.execute({ sql: "INSERT INTO categories (id, name, slug, image) VALUES (?, 'Women', 'women', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop')", args: [randomUUID()] });
    await turso.execute({ sql: "INSERT INTO categories (id, name, slug, image) VALUES (?, 'Kids', 'kids', 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=400&fit=crop')", args: [randomUUID()] });
    await turso.execute({ sql: "INSERT INTO categories (id, name, slug, image) VALUES (?, 'Accessories', 'accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop')", args: [randomUUID()] });
    await turso.execute({ sql: "INSERT INTO categories (id, name, slug, image) VALUES (?, 'Footwear', 'footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop')", args: [randomUUID()] });
    console.log('Categories seeded!');
  }

  // Get category IDs
  const catResult = await turso.execute('SELECT id FROM categories');
  const catIds = catResult.rows.map(r => r.id as string);
  console.log('Category IDs:', catIds.length);

  // Seed products
  const existingProds = await turso.execute('SELECT COUNT(*) as c FROM products');
  if (Number(existingProds.rows[0].c) === 0) {
    const products = [
      { name: 'Classic Black T-Shirt', price: 799, wholesale: 399, stock: 50, catIdx: 0, sizes: '["S","M","L","XL"]', colors: '["#000000","#FFFFFF","#333333"]' },
      { name: 'Denim Jacket', price: 2499, wholesale: 1200, stock: 30, catIdx: 0, sizes: '["M","L","XL"]', colors: '["#1a237e","#263238","#424242"]' },
      { name: 'Slim Fit Chinos', price: 1299, wholesale: 650, stock: 45, catIdx: 0, sizes: '["28","30","32","34"]', colors: '["#5d4037","#263238","#1565c0"]' },
      { name: 'Formal White Shirt', price: 1499, wholesale: 700, stock: 35, catIdx: 0, sizes: '["S","M","L","XL"]', colors: '["#FFFFFF","#e0e0e0","#b3e5fc"]' },
      { name: 'Summer Floral Dress', price: 1899, wholesale: 900, stock: 25, catIdx: 1, sizes: '["XS","S","M","L"]', colors: '["#e91e63","#9c27b0","#ff9800"]' },
      { name: 'High-Waist Jeans', price: 1799, wholesale: 850, stock: 40, catIdx: 1, sizes: '["26","28","30","32"]', colors: '["#1a237e","#263238","#424242"]' },
      { name: 'Elegant Blouse', price: 1199, wholesale: 550, stock: 30, catIdx: 1, sizes: '["S","M","L"]', colors: '["#ffffff","#fce4ec","#e8eaf6"]' },
      { name: 'Cotton Kurti', price: 999, wholesale: 450, stock: 55, catIdx: 1, sizes: '["S","M","L","XL","XXL"]', colors: '["#e91e63","#4caf50","#ff9800"]' },
      { name: 'Kids Casual Set', price: 699, wholesale: 350, stock: 60, catIdx: 2, sizes: '["2-3Y","4-5Y","6-7Y","8-9Y"]', colors: '["#42a5f5","#66bb6a","#ef5350"]' },
      { name: 'Kids Party Dress', price: 1299, wholesale: 600, stock: 20, catIdx: 2, sizes: '["2-3Y","4-5Y","6-7Y"]', colors: '["#ec407a","#ab47bc","#7e57c2"]' },
      { name: 'Kids Denim Shorts', price: 599, wholesale: 280, stock: 40, catIdx: 2, sizes: '["4-5Y","6-7Y","8-9Y"]', colors: '["#1a237e","#263238"]' },
      { name: 'Leather Watch', price: 2999, wholesale: 1400, stock: 15, catIdx: 3, sizes: '["One Size"]', colors: '["#424242","#795548"]' },
      { name: 'Canvas Backpack', price: 1199, wholesale: 550, stock: 25, catIdx: 3, sizes: '["One Size"]', colors: '["#263238","#424242","#5d4037"]' },
      { name: 'Sunglasses Aviator', price: 899, wholesale: 400, stock: 35, catIdx: 3, sizes: '["One Size"]', colors: '["#212121","#ffd600","#c62828"]' },
      { name: 'Running Shoes', price: 3499, wholesale: 1700, stock: 20, catIdx: 4, sizes: '["7","8","9","10","11"]', colors: '["#212121","#f44336","#2196f3"]' },
      { name: 'Casual Sneakers', price: 2499, wholesale: 1200, stock: 30, catIdx: 4, sizes: '["6","7","8","9","10"]', colors: '["#ffffff","#212121","#795548"]' },
      { name: 'Sports Hoodie', price: 1599, wholesale: 750, stock: 35, catIdx: 0, sizes: '["M","L","XL"]', colors: '["#212121","#1565c0","#4caf50"]' },
      { name: 'Silk Saree', price: 3999, wholesale: 1900, stock: 15, catIdx: 1, sizes: '["Free Size"]', colors: '["#e91e63","#ff5722","#9c27b0"]' },
      { name: 'Kids School Shoes', price: 999, wholesale: 450, stock: 50, catIdx: 4, sizes: '["6","7","8","9","10"]', colors: '["#212121","#795548"]' },
      { name: 'Belt Classic', price: 799, wholesale: 350, stock: 40, catIdx: 3, sizes: '["One Size"]', colors: '["#212121","#5d4037","#795548"]' },
    ];

    const imgs = [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
    ];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const catId = catIds[p.catIdx] ? String(catIds[p.catIdx]) : null;
      const imagesStr = JSON.stringify([imgs[i], imgs[(i + 3) % imgs.length], imgs[(i + 7) % imgs.length], imgs[(i + 11) % imgs.length]]);
      
      await turso.execute({
        sql: `INSERT INTO products (id, name, slug, description, price, wholesale_price, stock, sizes, colors, images, category_id, featured)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          randomUUID(), p.name, p.name.toLowerCase().replace(/\s+/g, '-'),
          p.name + ' - Premium quality fabric with comfortable fit. Perfect for everyday wear.',
          p.price, p.wholesale, p.stock, p.sizes, p.colors, imagesStr,
          catId, i < 8 ? 1 : 0
        ],
      });
    }

    await turso.execute(`UPDATE categories SET product_count = (SELECT COUNT(*) FROM products WHERE category_id = categories.id)`);
    console.log('Products seeded!');
  }

  // Seed admin
  const existingAdmin = await turso.execute("SELECT COUNT(*) as c FROM admins WHERE user_id = 'admin'");
  if (Number(existingAdmin.rows[0].c) === 0) {
    await turso.execute({
      sql: "INSERT INTO admins (id, user_id, name, last_name, phone, password, code, is_master) VALUES (?, 'admin', 'ClothFasion', 'Admin', '+919876543210', 'admin123', '000000', 1)",
      args: [randomUUID()],
    });
    console.log('Admin seeded!');
  }

  // Seed shop settings
  const existingSettings = await turso.execute("SELECT COUNT(*) as c FROM shop_settings WHERE id = 'main'");
  if (Number(existingSettings.rows[0].c) === 0) {
    await turso.execute({
      sql: `INSERT INTO shop_settings (id, shop_name, gst_no, shop_phone, owner_name, address, terms)
            VALUES ('main', 'ClothFasion', '29ABCDE1234F1ZG', '+919876543210', 'ClothFasion Owner',
            '123 Fashion Street, Mumbai, Maharashtra 400001',
            '1. Returns accepted within 7 days. 2. Products must be unused with tags. 3. Refunds in 5-7 days.')`,
      args: [],
    });
    console.log('Shop settings seeded!');
  }

  // Seed demo orders
  const existingOrders = await turso.execute('SELECT COUNT(*) as c FROM orders');
  if (Number(existingOrders.rows[0].c) === 0) {
    const customerId = randomUUID();
    await turso.execute({
      sql: "INSERT INTO customers (id, first_name, last_name, mobile, pin, address, pincode, nearby_area) VALUES (?, 'Rahul', 'Sharma', '9876543210', '123456', '123 Fashion Street', '400001', 'Colaba')",
      args: [customerId],
    });

    const statuses = ['Delivered', 'Shipped', 'Packing', 'Confirmed', 'Pending'];
    const prods = await turso.execute('SELECT id, name, images, price FROM products LIMIT 5');

    for (let i = 0; i < 5; i++) {
      const prod = prods.rows[i];
      const d = new Date(); d.setDate(d.getDate() - (i * 3));
      const oId = randomUUID();

      await turso.execute({
        sql: `INSERT INTO orders (id, order_number, customer_id, status, total, address, pincode, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [oId, `CF${1001 + i}`, customerId, statuses[i], Number(prod.price) * (i + 1), '123 Fashion Street', '400001', d.toISOString()],
      });

      const pImgs = JSON.parse(prod.images as string);
      await turso.execute({
        sql: `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, size, color, quantity, price)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [randomUUID(), oId, prod.id, prod.name, pImgs[0], 'M', '#000000', i + 1, Number(prod.price)],
      });
    }

    await turso.execute({
      sql: 'UPDATE customers SET total_orders = 5, total_spent = (SELECT COALESCE(SUM(total),0) FROM orders WHERE customer_id = ?) WHERE id = ?',
      args: [customerId, customerId],
    });
    console.log('Demo orders seeded!');
  }

  console.log('\n✅ Database setup complete!');
}

setupDatabase().catch(console.error);
