'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Package } from 'lucide-react';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free'];

interface Product {
  id: string; name: string; description: string; price: number; wholesale_price: number | null;
  stock: number; sizes: string[]; colors: string[]; images: string[];
  category_id: string | null; category_name: string; featured: boolean;
}

const emptyProduct = {
  id: '', name: '', description: '', price: 0, wholesale_price: 0, stock: 0,
  sizes: [] as string[], colors: '', images: '', category_id: '', featured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyProduct);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(perPage) });
      if (search) params.set('search', search);
      if (categoryFilter !== 'all') params.set('category', categories.find((c) => c.id === categoryFilter)?.name || '');
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      let filtered = data.products || [];
      if (stockFilter === 'in') filtered = filtered.filter((p: Product) => p.stock > 20);
      if (stockFilter === 'low') filtered = filtered.filter((p: Product) => p.stock >= 5 && p.stock <= 20);
      if (stockFilter === 'out') filtered = filtered.filter((p: Product) => p.stock < 5);
      setProducts(filtered);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load products'); }
    setLoading(false);
  }, [page, perPage, search, categoryFilter, stockFilter, categories]);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(perPage) });
        if (search) params.set('search', search);
        if (categoryFilter !== 'all') params.set('category', categories.find((c) => c.id === categoryFilter)?.name || '');
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        let filtered = data.products || [];
        if (stockFilter === 'in') filtered = filtered.filter((p: Product) => p.stock > 20);
        if (stockFilter === 'low') filtered = filtered.filter((p: Product) => p.stock >= 5 && p.stock <= 20);
        if (stockFilter === 'out') filtered = filtered.filter((p: Product) => p.stock < 5);
        if (!cancelled) {
          setProducts(filtered);
          setTotal(data.total || 0);
        }
      } catch { if (!cancelled) toast.error('Failed to load products'); }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [page, perPage, search, categoryFilter, stockFilter, categories]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      id: p.id, name: p.name, description: p.description, price: p.price,
      wholesale_price: p.wholesale_price || 0, stock: p.stock,
      sizes: p.sizes || [], colors: (p.colors || []).join(', '), images: (p.images || []).join(', '),
      category_id: p.category_id || '', featured: p.featured,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Product name is required'); return; }
    setSaving(true);
    try {
      const sizesArr = form.sizes;
      const colorsArr = form.colors.split(',').map((c) => c.trim()).filter(Boolean);
      const imagesArr = form.images.split(',').map((c) => c.trim()).filter(Boolean);
      const body = {
        name: form.name, description: form.description, price: Number(form.price),
        wholesale_price: Number(form.wholesale_price) || null, stock: Number(form.stock),
        sizes: sizesArr, colors: colorsArr, images: imagesArr,
        category_id: form.category_id || null, featured: form.featured,
      };
      if (editId) {
        await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...body }) });
        toast.success('Product updated');
      } else {
        await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        toast.success('Product added');
      }
      setDialogOpen(false);
      fetchProducts();
    } catch { toast.error('Failed to save product'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/products?id=${deleteId}`, { method: 'DELETE' });
      toast.success('Product deleted');
      setDeleteOpen(false);
      fetchProducts();
    } catch { toast.error('Failed to delete product'); }
  };

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const totalPages = Math.ceil(total / perPage);

  const stockColor = (s: number) => s > 20 ? 'text-[#28A745]' : s >= 5 ? 'text-[#FFC107]' : 'text-[#DC3545]';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#1F2A3A]">All Products</h1>
          <Badge variant="secondary" className="bg-[#F5F7FA] text-[#5A6B7F]">{total}</Badge>
        </div>
        <Button onClick={openAdd} className="bg-[#FF5722] hover:bg-[#E64A19] text-white gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-[#E4E7EC]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6B7F]" />
              <Input placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={(v) => { setStockFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Stock" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-[#E4E7EC] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F7FA] hover:bg-[#F5F7FA]">
                <TableHead className="font-medium">Image</TableHead>
                <TableHead className="font-medium">Name</TableHead>
                <TableHead className="font-medium hidden md:table-cell">Category</TableHead>
                <TableHead className="font-medium text-right">Price</TableHead>
                <TableHead className="font-medium text-right">Stock</TableHead>
                <TableHead className="font-medium hidden lg:table-cell">Status</TableHead>
                <TableHead className="font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-[#5A6B7F]">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No products found</p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p, i) => (
                  <TableRow key={p.id} className={`admin-row ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] overflow-hidden flex-shrink-0">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-[#CBD5E1]" /></div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><p className="font-medium text-[#1F2A3A]">{p.name}</p></TableCell>
                    <TableCell className="hidden md:table-cell text-[#5A6B7F]">{p.category_name || '—'}</TableCell>
                    <TableCell className="text-right font-medium">₹{p.price.toLocaleString('en-IN')}</TableCell>
                    <TableCell className={`text-right font-medium ${stockColor(p.stock)}`}>{p.stock}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge className={p.stock > 0 ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]'}>
                        {p.stock > 0 ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4 text-[#5A6B7F]" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDeleteId(p.id); setDeleteOpen(true); }}>
                          <Trash2 className="h-4 w-4 text-[#DC3545]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5A6B7F]">Per page:</span>
          <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[70px] h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
            <Button key={n} variant={n === page ? 'default' : 'outline'} size="icon" className="h-8 w-8"
              onClick={() => setPage(n)}
              style={n === page ? { backgroundColor: '#FF5722', borderColor: '#FF5722' } : {}}>
              {n}
            </Button>
          ))}
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description..." rows={3} />
            </div>
            <div className="grid gap-2">
              <Label>Images (comma-separated URLs)</Label>
              <Input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://example.com/img1.jpg, https://..." />
            </div>
            <div>
              <Label className="mb-2 block">Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => (
                  <label key={size} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox checked={form.sizes.includes(size)} onCheckedChange={() => toggleSize(size)} />
                    <span className="text-sm">{size}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Colours (comma-separated hex codes)</Label>
              <Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="#FF5722, #28A745, #000000" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Sell Price *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label>Wholesale Price</Label>
                <Input type="number" value={form.wholesale_price} onChange={(e) => setForm({ ...form, wholesale_price: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label>Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
              {saving ? 'Saving...' : 'Save Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#DC3545] hover:bg-[#C82333]">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
