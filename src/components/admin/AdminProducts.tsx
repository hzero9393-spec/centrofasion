'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
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

  const stockColor = (s: number) =>
    s > 20 ? 'text-[#34D399]' : s >= 5 ? 'text-[#FBBF24]' : 'text-[#F87171]';

  const stockBadge = (s: number) =>
    s > 0
      ? 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20'
      : 'bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[var(--theme-text)]">All Products</h1>
          <Badge className="bg-white/5 text-[var(--theme-text-muted)] border border-white/10 hover:bg-white/5">
            {total}
          </Badge>
        </div>
        <Button
          onClick={openAdd}
          className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:from-[var(--theme-primary)] hover:to-[#E6234D] text-white gap-2 border-0 shadow-lg shadow-[var(--theme-primary)]/20"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-muted)]" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--theme-primary)] rounded-xl"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 text-white rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--theme-card)] border-white/10">
              <SelectItem value="all" className="text-[var(--theme-text)] focus:bg-white/5 focus:text-[var(--theme-text)]">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-[var(--theme-text)] focus:bg-white/5 focus:text-[var(--theme-text)]">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={(v) => { setStockFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white/5 border-white/10 text-white rounded-xl">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--theme-card)] border-white/10">
              <SelectItem value="all" className="text-[var(--theme-text)] focus:bg-white/5 focus:text-[var(--theme-text)]">All Stock</SelectItem>
              <SelectItem value="in" className="text-[var(--theme-text)] focus:bg-white/5 focus:text-[var(--theme-text)]">In Stock</SelectItem>
              <SelectItem value="low" className="text-[var(--theme-text)] focus:bg-white/5 focus:text-[var(--theme-text)]">Low Stock</SelectItem>
              <SelectItem value="out" className="text-[var(--theme-text)] focus:bg-white/5 focus:text-[var(--theme-text)]">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/[0.03] hover:bg-white/[0.03] border-white/[0.06]">
                <TableHead className="font-medium text-[var(--theme-text-muted)]">Image</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)]">Name</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] hidden md:table-cell">Category</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-right">Price</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-right">Stock</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] hidden lg:table-cell">Status</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-white/[0.06]">
                    <TableCell colSpan={7}><Skeleton className="h-12 w-full bg-white/5 rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow className="border-white/[0.06]">
                  <TableCell colSpan={7} className="text-center py-16 text-[var(--theme-text-muted)]">
                    <Package className="h-10 w-10 mx-auto mb-3 text-white/20" />
                    <p className="text-[var(--theme-text)]">No products found</p>
                    <p className="text-sm text-white/40 mt-1">Try adjusting your filters</p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p, i) => (
                  <TableRow
                    key={p.id}
                    className={`border-white/[0.06] hover:bg-white/5 transition-colors ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}
                  >
                    <TableCell>
                      <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/[0.06]">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-white/20" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-[var(--theme-text)]">{p.name}</p>
                      {p.featured && (
                        <span className="text-[10px] font-medium text-[#FFB020] bg-[#FFB020]/10 px-1.5 py-0.5 rounded-full border border-[#FFB020]/20">
                          Featured
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-[var(--theme-text-muted)]">{p.category_name || '—'}</TableCell>
                    <TableCell className="text-right font-medium text-[var(--theme-text)]">₹{p.price.toLocaleString('en-IN')}</TableCell>
                    <TableCell className={`text-right font-semibold ${stockColor(p.stock)}`}>{p.stock}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge className={`${stockBadge(p.stock)} text-xs rounded-full border`}>
                        {p.stock > 0 ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-white/10 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#F87171] hover:bg-[#F87171]/10"
                          onClick={() => { setDeleteId(p.id); setDeleteOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--theme-text-muted)]">Per page:</span>
          <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[70px] h-8 text-sm bg-white/5 border-white/10 text-white rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--theme-card)] border-white/10">
              <SelectItem value="10" className="text-[var(--theme-text)] focus:bg-white/5">10</SelectItem>
              <SelectItem value="25" className="text-[var(--theme-text)] focus:bg-white/5">25</SelectItem>
              <SelectItem value="50" className="text-[var(--theme-text)] focus:bg-white/5">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              variant={n === page ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => setPage(n)}
              style={n === page ? {
                background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))',
                borderColor: 'transparent',
              } : {
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            >
              {n}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--theme-card)] border border-white/10 rounded-2xl [&>button]:text-white/50 hover:[&>button]:text-white">
          <DialogHeader>
            <DialogTitle className="text-[var(--theme-text)]">{editId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            <div className="grid gap-2">
              <Label className="text-[var(--theme-text-muted)]">Product Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter product name"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--theme-primary)] rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[var(--theme-text-muted)]">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--theme-primary)] rounded-xl resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[var(--theme-text-muted)]">Images (comma-separated URLs)</Label>
              <Input
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                placeholder="https://example.com/img1.jpg, https://..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--theme-primary)] rounded-xl"
              />
            </div>
            <div>
              <Label className="text-[var(--theme-text-muted)] mb-2 block">Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => (
                  <label
                    key={size}
                    className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border transition-all ${
                      form.sizes.includes(size)
                        ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]'
                        : 'bg-white/5 border-white/10 text-[var(--theme-text-muted)] hover:bg-white/10 hover:text-[var(--theme-text)]'
                    }`}
                  >
                    <Checkbox
                      checked={form.sizes.includes(size)}
                      onCheckedChange={() => toggleSize(size)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{size}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-[var(--theme-text-muted)]">Colours (comma-separated hex codes)</Label>
              <Input
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                placeholder="var(--theme-primary), #28A745, #000000"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--theme-primary)] rounded-xl"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label className="text-[var(--theme-text-muted)]">Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--theme-card)] border-white/10">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-[var(--theme-text)] focus:bg-white/5 focus:text-[var(--theme-text)]">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[var(--theme-text-muted)]">Sell Price *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--theme-primary)] rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[var(--theme-text-muted)]">Wholesale Price</Label>
                <Input
                  type="number"
                  value={form.wholesale_price}
                  onChange={(e) => setForm({ ...form, wholesale_price: Number(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--theme-primary)] rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[var(--theme-text-muted)]">Quantity</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--theme-primary)] rounded-xl"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[var(--theme-primary)] data-[state=checked]:to-[var(--theme-secondary)]"
                />
                <Label className="text-[var(--theme-text-muted)]">Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:from-[var(--theme-primary)] hover:to-[#E6234D] text-white border-0 shadow-lg shadow-[var(--theme-primary)]/20 rounded-xl"
            >
              {saving ? 'Saving...' : 'Save Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[var(--theme-card)] border border-white/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--theme-text)]">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--theme-text-muted)]">
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#F87171] hover:bg-[#EF4444] text-white border-0 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
