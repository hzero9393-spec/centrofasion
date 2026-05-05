'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@/stores/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product, Category } from './SharedTypes';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#DC3545' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#28A745' },
  { name: 'Yellow', hex: '#FFC107' },
  { name: 'Purple', hex: '#9C27B0' },
  { name: 'Orange', hex: '#FF5722' },
];
const DISCOUNT_RANGES = ['10%+', '20%+', '40%+', '50%+'];
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Popularity' },
];

export default function ShopPage() {
  const { navigate, pageParams } = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [sortBy, setSortBy] = useState(pageParams.sort || 'recommended');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    pageParams.category ? [pageParams.category] : []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(50000);
  const [searchQuery, setSearchQuery] = useState(pageParams.search || '');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const limit = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('sort', sortBy === 'recommended' ? 'newest' : sortBy);
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchQuery) params.set('search', searchQuery);
      selectedCategories.forEach((c) => params.append('category', c));

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      let filtered: Product[] = data.products || [];

      // Client-side filtering
      if (selectedSizes.length > 0) {
        filtered = filtered.filter((p) =>
          selectedSizes.some((s) => p.sizes.includes(s))
        );
      }
      if (selectedColors.length > 0) {
        filtered = filtered.filter((p) =>
          selectedColors.some((c) =>
            p.colors.map((pc) => pc.toLowerCase()).includes(c.toLowerCase())
          )
        );
      }
      if (selectedDiscounts.length > 0) {
        filtered = filtered.filter((p) => {
          if (!p.wholesale_price || p.wholesale_price <= p.price) return false;
          const disc = Math.round(((p.wholesale_price - p.price) / p.wholesale_price) * 100);
          return selectedDiscounts.some((d) => {
            const min = parseInt(d);
            return disc >= min;
          });
        });
      }
      filtered = filtered.filter(
        (p) => p.price >= priceMin && p.price <= priceMax
      );

      setProducts(filtered);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [sortBy, page, searchQuery, selectedCategories, selectedSizes, selectedColors, selectedDiscounts, priceMin, priceMax]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.categories || []);
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

  const toggleDiscount = (d: string) => {
    setSelectedDiscounts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedDiscounts([]);
    setPriceMin(0);
    setPriceMax(50000);
    setSearchQuery('');
    setPage(1);
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedSizes.length +
    selectedColors.length +
    selectedDiscounts.length +
    (priceMin > 0 || priceMax < 50000 ? 1 : 0);

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, products.length > 0 ? total : 0);

  const FilterContent = () => (
    <div className="space-y-0">
      {/* Category */}
      <div className="filter-section">
        <h4 className="font-bold text-sm text-cf-text mb-3">Category</h4>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={selectedCategories.includes(cat.slug)}
                onCheckedChange={() => toggleCategory(cat.slug)}
                className="rounded data-[state=checked]:bg-[#FF5722] data-[state=checked]:border-[#FF5722]"
              />
              <span className="text-sm text-white/50 group-hover:text-cf-text flex-1">
                {cat.name}
              </span>
              <span className="text-xs text-white/30">({cat.product_count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h4 className="font-bold text-sm text-cf-text mb-3">Price Range</h4>
        <div className="flex items-center gap-2 mb-3">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin || ''}
            onChange={(e) => { setPriceMin(parseInt(e.target.value) || 0); setPage(1); }}
            className="h-9 text-sm rounded-lg w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-[#FF5722]/50"
            min={0}
            max={50000}
            step={500}
          />
          <span className="text-white/50 text-sm">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceMax || ''}
            onChange={(e) => { setPriceMax(parseInt(e.target.value) || 50000); setPage(1); }}
            className="h-9 text-sm rounded-lg w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-[#FF5722]/50"
            min={0}
            max={50000}
            step={500}
          />
        </div>
        <input
          type="range"
          min={0}
          max={50000}
          step={500}
          value={priceMax}
          onChange={(e) => { setPriceMax(parseInt(e.target.value)); setPage(1); }}
          className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-[#FF5722]"
        />
        <div className="flex justify-between text-xs text-white/50 mt-1">
          <span>₹0</span>
          <span>₹50,000</span>
        </div>
      </div>

      {/* Size */}
      <div className="filter-section">
        <h4 className="font-bold text-sm text-cf-text mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedSizes.includes(size)
                  ? 'bg-gradient-to-r from-[#FF5722] to-[#FF2D55] text-white border-transparent'
                  : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colour */}
      <div className="filter-section">
        <h4 className="font-bold text-sm text-cf-text mb-3">Colour</h4>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              title={color.name}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColors.includes(color.name)
                  ? 'border-[#FF5722] scale-110 ring-2 ring-[#FF5722]/30'
                  : 'border-white/10 hover:border-white/30'
              } ${color.name === 'White' ? 'shadow-sm' : ''}`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>

      {/* Discount */}
      <div className="filter-section">
        <h4 className="font-bold text-sm text-cf-text mb-3">Discount</h4>
        <div className="space-y-2.5">
          {DISCOUNT_RANGES.map((d) => (
            <label key={d} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={selectedDiscounts.includes(d)}
                onCheckedChange={() => toggleDiscount(d)}
                className="rounded data-[state=checked]:bg-[#FF5722] data-[state=checked]:border-[#FF5722]"
              />
              <span className="text-sm text-white/50 group-hover:text-cf-text">{d} off</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-sm text-[#DC3545] font-medium hover:underline mt-2"
        >
          Clear All Filters
        </button>
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
              <Button variant="outline" className="lg:hidden h-10 rounded-lg border-white/10 bg-white/5 text-white hover:bg-white/10">
                <SlidersHorizontal className="size-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-gradient-to-r from-[#FF5722] to-[#FF2D55] text-white text-[10px] h-5 min-w-5 px-1.5 rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto bg-[#1D1D1F] border-white/10">
              <DialogHeader>
                <DialogTitle className="font-bold text-lg text-cf-text">Filters</DialogTitle>
              </DialogHeader>
              <FilterContent />
            </DialogContent>
          </Dialog>

          <div>
            <h1 className="text-xl font-bold text-cf-text">
              {searchQuery ? `Results for "${searchQuery}"` : 'Shop'}
            </h1>
            {!loading && (
              <p className="text-sm text-white/50">
                Showing {startItem}–{endItem} of {total} results
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-[180px] h-10 rounded-lg border-white/10 text-sm bg-white/5 text-white">
              <span className="text-white/50 text-xs mr-1">Sort by</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1D1D1F] border-white/10">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-white focus:bg-white/5 focus:text-white">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="hidden sm:flex items-center border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-gradient-to-r from-[#FF5722] to-[#FF2D55] text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gradient-to-r from-[#FF5722] to-[#FF2D55] text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filters pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-white/50">Active filters:</span>
          {selectedCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="text-xs gap-1 pr-1 bg-white/5 border border-white/10 text-white">
              {cat}
              <button onClick={() => toggleCategory(cat)}><X className="size-3" /></button>
            </Badge>
          ))}
          {selectedSizes.map((s) => (
            <Badge key={s} variant="secondary" className="text-xs gap-1 pr-1 bg-white/5 border border-white/10 text-white">
              Size: {s}
              <button onClick={() => toggleSize(s)}><X className="size-3" /></button>
            </Badge>
          ))}
          {selectedColors.map((c) => (
            <Badge key={c} variant="secondary" className="text-xs gap-1 pr-1 bg-white/5 border border-white/10 text-white">
              {c}
              <button onClick={() => toggleColor(c)}><X className="size-3" /></button>
            </Badge>
          ))}
          {selectedDiscounts.map((d) => (
            <Badge key={d} variant="secondary" className="text-xs gap-1 pr-1 bg-white/5 border border-white/10 text-white">
              {d} off
              <button onClick={() => toggleDiscount(d)}><X className="size-3" /></button>
            </Badge>
          ))}
          {(priceMin > 0 || priceMax < 50000) && (
            <Badge variant="secondary" className="text-xs gap-1 pr-1 bg-white/5 border border-white/10 text-white">
              ₹{priceMin.toLocaleString('en-IN')} - ₹{priceMax.toLocaleString('en-IN')}
              <button onClick={() => { setPriceMin(0); setPriceMax(50000); }}><X className="size-3" /></button>
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-24 bg-[#1D1D1F] rounded-xl border border-white/5 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-cf-text">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-sm text-[#DC3545] font-medium hover:underline">
                  Clear All
                </button>
              )}
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Product grid/list area */}
        <div className="flex-1 min-w-0">
          {loading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="aspect-[3/4] rounded-xl mb-3" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-32 h-32 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-cf-text mb-2">No products found</h3>
              <p className="text-sm text-white/50 mb-4">Try adjusting your filters or search query.</p>
              <Button variant="outline" onClick={clearFilters} className="rounded-lg border-white/10 text-white hover:bg-white/5">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => navigate('product', { id: product.id })}
                      className="product-card flex gap-4 bg-[#1D1D1F] rounded-xl border border-white/5 p-4 cursor-pointer hover:border-white/10 transition-colors"
                    >
                      <div className="shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden bg-white/5">
                        <img
                          src={product.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-sm font-semibold text-cf-text line-clamp-2 mb-1">{product.name}</h3>
                        {product.category_name && (
                          <p className="text-xs text-white/50 mb-2">{product.category_name}</p>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base font-bold text-cf-text">₹{product.price.toLocaleString('en-IN')}</span>
                          {product.wholesale_price && product.wholesale_price > product.price && (
                            <>
                              <span className="text-sm text-white/50 line-through">₹{product.wholesale_price.toLocaleString('en-IN')}</span>
                              <span className="discount-tag">
                                {Math.round(((product.wholesale_price - product.price) / product.wholesale_price) * 100)}% off
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {product.sizes.slice(0, 4).map((s) => (
                            <span key={s} className="text-[10px] border border-white/10 rounded px-1.5 py-0.5 text-white/50">{s}</span>
                          ))}
                          {product.sizes.length > 4 && <span className="text-[10px] text-white/50">+{product.sizes.length - 4}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-lg h-9 border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && page > 3) pageNum = page - 2 + i;
                    if (pageNum < 1) pageNum = 1;
                    if (pageNum > totalPages) pageNum = totalPages;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`rounded-lg h-9 w-9 p-0 ${page === pageNum ? 'bg-gradient-to-r from-[#FF5722] to-[#FF2D55] text-white hover:from-[#FF5722] hover:to-[#FF2D55]' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && page < totalPages - 2 && (
                    <span className="text-white/50 text-sm px-1">...</span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-lg h-9 border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    Next
                    <ChevronRight className="size-4 ml-1" />
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
