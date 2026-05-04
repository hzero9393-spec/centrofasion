'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@/stores/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react';
import ProductCard, { type Product } from './ProductCard';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36'];
const COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Orange', hex: '#FF6A00' },
  { name: 'Brown', hex: '#92400E' },
  { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Gray', hex: '#6B7280' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

export default function ShopPage() {
  const { navigate, pageParams } = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; product_count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [sortBy, setSortBy] = useState(pageParams.sort || 'newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    pageParams.category ? [pageParams.category] : []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [searchQuery, setSearchQuery] = useState(pageParams.search || '');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const limit = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('sort', sortBy);
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchQuery) params.set('search', searchQuery);
      selectedCategories.forEach((c) => params.append('category', c));
      
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      
      let filtered = data.products || [];
      
      // Client-side filtering for sizes, colors, price
      if (selectedSizes.length > 0) {
        filtered = filtered.filter((p: Product) =>
          selectedSizes.some((s) => p.sizes.includes(s))
        );
      }
      if (selectedColors.length > 0) {
        filtered = filtered.filter((p: Product) =>
          selectedColors.some((c) =>
            p.colors.map((pc) => pc.toLowerCase()).includes(c.toLowerCase())
          )
        );
      }
      filtered = filtered.filter(
        (p: Product) => p.price >= priceRange[0] && p.price <= priceRange[1]
      );

      setProducts(filtered);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [sortBy, page, searchQuery, selectedCategories, selectedSizes, selectedColors, priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
      } catch {}
    }
    fetchCategories();
  }, []);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
    setPage(1);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setPage(1);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 10000]);
    setSearchQuery('');
    setPage(1);
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedSizes.length +
    selectedColors.length +
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-[#111] mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={selectedCategories.includes(cat.slug)}
                onCheckedChange={() => toggleCategory(cat.slug)}
                className="rounded-md data-[state=checked]:bg-[#FF6A00] data-[state=checked]:border-[#FF6A00]"
              />
              <span className="text-sm text-gray-600 group-hover:text-[#111]">
                {cat.name}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {cat.product_count}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold text-[#111] mb-3">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={10000}
          step={100}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
          <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="text-sm font-semibold text-[#111] mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-[#111] text-white border-[#111]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#111]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="text-sm font-semibold text-[#111] mb-3">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              title={color.name}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColors.includes(color.name)
                  ? 'border-[#FF6A00] scale-110 ring-2 ring-[#FF6A00]/30'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="text-[#FF6A00] text-sm w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Mobile filter button */}
          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="md:hidden h-10 rounded-xl">
                <SlidersHorizontal className="size-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-[#FF6A00] text-white text-[10px] h-5 min-w-5 px-1.5 rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-poppins)]">
                  Filters
                </DialogTitle>
              </DialogHeader>
              <FilterContent />
            </DialogContent>
          </Dialog>

          <div>
            <h1 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#111]">
              {searchQuery ? `Results for "${searchQuery}"` : 'Shop'}
            </h1>
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${total} products found`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative hidden sm:block">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-48 h-10 bg-white rounded-xl text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="size-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-44 h-10 rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Active filters:</span>
          {selectedCategories.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="text-xs gap-1 pr-1"
            >
              {cat}
              <button onClick={() => toggleCategory(cat)}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {selectedSizes.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="text-xs gap-1 pr-1"
            >
              Size: {s}
              <button onClick={() => toggleSize(s)}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {selectedColors.map((c) => (
            <Badge
              key={c}
              variant="secondary"
              className="text-xs gap-1 pr-1"
            >
              {c}
              <button onClick={() => toggleColor(c)}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 bg-white rounded-xl p-5 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111]">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#FF6A00] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {/* Mobile search */}
          <div className="relative sm:hidden mb-4">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="h-10 bg-white rounded-xl text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="size-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-square rounded-xl mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your filters or search query.
              </p>
              <Button variant="outline" onClick={clearFilters} className="rounded-xl">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-xl"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                    (p) => (
                      <Button
                        key={p}
                        variant={page === p ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(p)}
                        className={`rounded-xl ${page === p ? 'bg-[#111]' : ''}`}
                      >
                        {p}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-xl"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
