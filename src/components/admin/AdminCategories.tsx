'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[var(--theme-text)]">Categories</h1>
          <Badge className="bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)] hover:bg-[var(--theme-surface)]">
            {categories.length}
          </Badge>
        </div>
        <Button
          onClick={openAdd}
          className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:from-[var(--theme-primary)] hover:to-[#E6234D] text-white gap-2 border-0 shadow-lg shadow-[var(--theme-primary)]/20"
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl overflow-hidden">
              <Skeleton className="h-40 w-full bg-[var(--theme-surface)] rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-[var(--theme-surface)] rounded-xl" />
                <Skeleton className="h-5 w-1/2 bg-[var(--theme-surface)] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl">
          <div className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-[var(--theme-surface)] flex items-center justify-center mx-auto mb-4">
              <Grid3X3 className="h-7 w-7 text-[var(--theme-text-muted)]" />
            </div>
            <p className="text-[var(--theme-text)] font-medium">No categories yet</p>
            <p className="text-sm text-[var(--theme-text-muted)] mt-1">Create your first category to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300"
            >
              {/* Image */}
              <div className="h-36 bg-[var(--theme-surface)] relative overflow-hidden">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Grid3X3 className="h-8 w-8 text-[var(--theme-text-muted)]" />
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-card)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Hover Actions */}
                <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <Button
                    size="icon"
                    className="h-7 w-7 bg-black/40 backdrop-blur-sm border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] shadow-lg rounded-lg"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-7 w-7 bg-black/40 backdrop-blur-sm border border-[var(--theme-border)] text-[#F87171] hover:bg-[#F87171]/20 shadow-lg rounded-lg"
                    onClick={() => { setDeleteId(c.id); setDeleteOpen(true); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {/* Content */}
              <div className="p-4">
                <h3 className="font-medium text-[var(--theme-text)] group-hover:text-[var(--theme-text)] transition-colors">{c.name}</h3>
                <Badge
                  variant="secondary"
                  className="mt-2 bg-[var(--theme-surface)] text-[var(--theme-text-muted)] text-xs border border-[var(--theme-border)] hover:bg-[var(--theme-surface)]"
                >
                  {c.product_count} products
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl [&>button]:text-[var(--theme-text-muted)] hover:[&>button]:text-[var(--theme-text)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--theme-text)]">{editId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            <div className="grid gap-2">
              <Label className="text-[var(--theme-text-muted)]">Category Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., T-Shirts"
                className="bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:border-[var(--theme-primary)] rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[var(--theme-text-muted)]">Image URL</Label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:border-[var(--theme-primary)] rounded-xl"
              />
            </div>
            {image && (
              <div className="h-36 rounded-2xl bg-[var(--theme-surface)] overflow-hidden border border-[var(--theme-border)]">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:from-[var(--theme-primary)] hover:to-[#E6234D] text-white border-0 shadow-lg shadow-[var(--theme-primary)]/20 rounded-xl"
            >
              {saving ? 'Saving...' : 'Save Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--theme-text)]">Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--theme-text-muted)]">
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)] rounded-xl">
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
