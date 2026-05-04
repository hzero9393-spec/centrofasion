'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesale_price: number | null;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  featured: boolean;
}

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free'];

const emptyProduct = {
  name: '',
  description: '',
  price: 0,
  wholesale_price: 0,
  stock: 0,
  sizes: [] as string[],
  colors: [] as string[],
  images: '',
  category_id: '',
  featured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.set('category', filterCategory);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '100');
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      setProducts(json.products || []);
    } catch {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      setCategories(json || []);
    } catch {
      toast.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddDialog = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      wholesale_price: product.wholesale_price || 0,
      stock: product.stock,
      sizes: product.sizes,
      colors: product.colors,
      images: product.images.join(', '),
      category_id: product.category_id || '',
      featured: product.featured,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (form.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editingProduct?.id,
        name: form.name,
        description: form.description,
        price: form.price,
        wholesale_price: form.wholesale_price > 0 ? form.wholesale_price : null,
        stock: form.stock,
        sizes: form.sizes,
        colors: form.colors,
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        category_id: form.category_id || null,
        featured: form.featured,
      };

      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      toast.success(editingProduct ? 'Product updated' : 'Product created');
      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      const res = await fetch(`/api/products?id=${deletingProduct.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Product deleted');
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  };

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-12 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-poppins)] text-[#111111]">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} products found</p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-[#FF6A00] hover:bg-[#e65e00] text-white rounded-xl h-10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-xl shadow-sm border-0">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48 rounded-xl">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, idx) => (
                <TableRow key={product.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-[#111111]">{product.name}</p>
                      {product.featured && <Badge className="mt-1 bg-[#FF6A00] text-white text-[10px] px-1.5 py-0">Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">{fmt(product.price)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={product.stock > 10 ? 'secondary' : 'destructive'} className="text-xs">
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{product.category_name || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(product)}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setDeletingProduct(product); setDeleteDialogOpen(true); }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-[var(--font-poppins)]">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Product name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description"
                className="rounded-xl min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Wholesale Price</Label>
                <Input
                  type="number"
                  value={form.wholesale_price}
                  onChange={(e) => setForm({ ...form, wholesale_price: Number(e.target.value) })}
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <Label>Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => (
                  <label
                    key={size}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${
                      form.sizes.includes(size)
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Checkbox
                      checked={form.sizes.includes(size)}
                      onCheckedChange={() => toggleSize(size)}
                      className="sr-only"
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label>Colors (comma-separated)</Label>
              <Input
                value={form.colors.join(', ')}
                onChange={(e) => setForm({
                  ...form,
                  colors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })}
                placeholder="Red, Blue, Black"
                className="rounded-xl"
              />
            </div>

            {/* Image URLs */}
            <div className="space-y-2">
              <Label>Image URLs (comma-separated)</Label>
              <Input
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                placeholder="https://example.com/image1.jpg, https://..."
                className="rounded-xl"
              />
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center justify-between">
              <Label>Featured Product</Label>
              <Switch
                checked={form.featured}
                onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#111111] hover:bg-[#333333] text-white rounded-xl"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingProduct?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
