'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Grid3X3 } from 'lucide-react';

interface Category {
  id: string; name: string; slug: string; image: string; product_count: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load categories'); }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      } catch { if (!cancelled) toast.error('Failed to load categories'); }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const openAdd = () => {
    setEditId(null);
    setName('');
    setImage('');
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditId(c.id);
    setName(c.name);
    setImage(c.image || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await fetch('/api/categories', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, name, image }),
        });
        toast.success('Category updated');
      } else {
        await fetch('/api/categories', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, image }),
        });
        toast.success('Category added');
      }
      setDialogOpen(false);
      fetchCategories();
    } catch { toast.error('Failed to save category'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/categories?id=${deleteId}`, { method: 'DELETE' });
      toast.success('Category deleted');
      setDeleteOpen(false);
      fetchCategories();
    } catch { toast.error('Failed to delete category'); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1F2A3A]">Categories</h1>
        <Button onClick={openAdd} className="bg-[#FF5722] hover:bg-[#E64A19] text-white gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-[#E4E7EC]"><CardContent className="p-0"><Skeleton className="h-48 w-full rounded-xl" /></CardContent></Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card className="border-[#E4E7EC]">
          <CardContent className="py-16 text-center">
            <Grid3X3 className="h-10 w-10 mx-auto mb-3 text-[#CBD5E1]" />
            <p className="text-[#5A6B7F]">No categories yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Card key={c.id} className="border-[#E4E7EC] overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="h-32 bg-[#F5F7FA] relative overflow-hidden">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Grid3X3 className="h-8 w-8 text-[#CBD5E1]" />
                  </div>
                )}
                {/* Hover Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="icon" className="h-7 w-7 bg-white/90 shadow-sm" onClick={() => openEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-7 w-7 bg-white/90 shadow-sm" onClick={() => { setDeleteId(c.id); setDeleteOpen(true); }}>
                    <Trash2 className="h-3.5 w-3.5 text-[#DC3545]" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-[#1F2A3A]">{c.name}</h3>
                <Badge variant="secondary" className="mt-1.5 bg-[#F5F7FA] text-[#5A6B7F] text-xs">
                  {c.product_count} products
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Category Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., T-Shirts" />
            </div>
            <div className="grid gap-2">
              <Label>Image URL</Label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
            </div>
            {image && (
              <div className="h-32 rounded-lg bg-[#F5F7FA] overflow-hidden">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
              {saving ? 'Saving...' : 'Save Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
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
