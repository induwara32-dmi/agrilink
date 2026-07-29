'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Select } from '@/components/ui/select';
import { getCategories, getProducts } from '@/lib/api/catalog';
import type { Product, ProductQuery, ProductSort } from '@/lib/api/types';

function ProductResult({ product }: { product: Product }) {
  const available = Number(product.inventory?.quantityOnHand ?? 0) - Number(product.inventory?.quantityReserved ?? 0);
  return <ProductCard id={product.id} title={product.name} price={`${new Intl.NumberFormat(undefined, { style: 'currency', currency: product.currency }).format(Number(product.unitPrice))}/${product.unit}`} farmer={product.farmer.farmName || product.farmer.user.profile?.displayName || 'AgriLink farmer'} location={product.category.name} rating="New" badge={available > 0 ? 'Available' : 'Out of stock'} imageUrl={product.images[0]?.url} />;
}

export function CatalogGrid({ featured = false }: { featured?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const query: ProductQuery = featured ? { page: 1, pageSize: 6, sort: 'newest' } : {
    page: Number(searchParams.get('page') ?? 1), pageSize: 6,
    search: searchParams.get('search') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    minPrice: searchParams.get('minPrice') ?? undefined,
    maxPrice: searchParams.get('maxPrice') ?? undefined,
    sort: (searchParams.get('sort') as ProductSort | null) ?? 'newest',
  };
  const products = useQuery({ queryKey: ['products', query], queryFn: () => getProducts(query) });
  const categories = useQuery({ queryKey: ['categories'], queryFn: getCategories, enabled: !featured });

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    if (name !== 'page') params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  if (products.isLoading) return <LoadingSkeleton />;
  if (products.isError) return <ErrorState title="Marketplace unavailable" description="We could not load products from the marketplace." onRetry={() => void products.refetch()} />;
  const items = products.data?.data ?? [];
  const meta = products.data?.meta;

  return (
    <div className="space-y-4">
      {!featured ? <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select aria-label="Filter by category" value={query.categoryId ?? ''} onChange={(event) => updateParam('categoryId', event.target.value)}>
          <option value="">All categories</option>{(categories.data?.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </Select>
        <Input aria-label="Minimum price" type="number" min="0" step="0.01" placeholder="Minimum price" defaultValue={query.minPrice} onBlur={(event) => updateParam('minPrice', event.target.value)} />
        <Input aria-label="Maximum price" type="number" min="0" step="0.01" placeholder="Maximum price" defaultValue={query.maxPrice} onBlur={(event) => updateParam('maxPrice', event.target.value)} />
        <Select aria-label="Sort products" value={query.sort} onChange={(event) => updateParam('sort', event.target.value)}>
          <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="priceAsc">Price: low to high</option><option value="priceDesc">Price: high to low</option><option value="nameAsc">Name: A–Z</option><option value="nameDesc">Name: Z–A</option>
        </Select>
      </div> : null}
      {items.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((product) => <ProductResult key={product.id} product={product} />)}</div> : <EmptyState title="No products found" description="Try changing your search or filters." />}
      {!featured && meta && meta.totalPages > 1 ? <nav aria-label="Product results pages" className="flex items-center justify-center gap-3">
        <Button variant="outline" disabled={meta.page <= 1} onClick={() => updateParam('page', String(meta.page - 1))}>Previous</Button>
        <span className="text-sm text-slate-600">Page {meta.page} of {meta.totalPages}</span>
        <Button variant="outline" disabled={meta.page >= meta.totalPages} onClick={() => updateParam('page', String(meta.page + 1))}>Next</Button>
      </nav> : null}
    </div>
  );
}
