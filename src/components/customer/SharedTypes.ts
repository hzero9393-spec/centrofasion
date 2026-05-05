export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  wholesale_price: number | null;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  category_id: string;
  category_name: string;
  category_slug?: string;
  featured: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  product_count: number;
}
