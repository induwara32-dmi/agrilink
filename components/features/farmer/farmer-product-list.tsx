'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, PackagePlus, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Select } from '@/components/ui/select';
import { ToastMessage } from '@/components/ui/toast-message';
import { catalogQueryKeys, deleteProduct, getCategories, getManagedProducts } from '@/lib/api/catalog';
import type { ProductQuery, ProductStatus } from '@/lib/api/types';

const statusTone = (status: ProductStatus): 'success' | 'warning' | 'danger' | 'outline' => status === 'ACTIVE' ? 'success' : status === 'DRAFT' ? 'warning' : status === 'ARCHIVED' ? 'danger' : 'outline';

export function FarmerProductList() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<ProductQuery>({ page: 1, pageSize: 12, sort: 'newest' });
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(() => {
    if (typeof window === 'undefined') return null;
    const success = new URLSearchParams(window.location.search).get('success');
    return success === 'created' || success === 'updated' ? { message: `Product ${success} successfully.`, tone: 'success' } : null;
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const products = useQuery({ queryKey: catalogQueryKeys.managedProducts(query), queryFn: () => getManagedProducts(query) });
  const categories = useQuery({ queryKey: catalogQueryKeys.categories(), queryFn: getCategories });

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setQuery(current => ({ ...current, page: 1, search: String(form.get('search') ?? '').trim() || undefined, categoryId: String(form.get('categoryId') ?? '') || undefined, status: (String(form.get('status') ?? '') || undefined) as ProductStatus | undefined }));
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Archive “${name}”? It will no longer appear in the marketplace.`)) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setToast({ message: 'Product archived successfully.', tone: 'success' });
      await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
    } catch (cause) {
      setToast({ message: cause instanceof Error ? cause.message : 'Unable to archive the product.', tone: 'error' });
    } finally { setDeletingId(null); }
  }

  const meta = products.data?.meta;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Farmer workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Products</h1><p className="mt-2 text-sm text-slate-600">Create, publish, and maintain your agricultural listings.</p></div><Button asChild><Link href="/farmer/products/new"><PackagePlus className="h-4 w-4" />Add Product</Link></Button></div>
    <Card><CardContent className="pt-6"><form onSubmit={search} className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto]"><Input name="search" aria-label="Search products" placeholder="Search products" defaultValue={query.search} /><Select name="categoryId" aria-label="Filter by category" defaultValue={query.categoryId ?? ''}><option value="">All categories</option>{categories.data?.data.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</Select><Select name="status" aria-label="Filter by status" defaultValue={query.status ?? ''}><option value="">All statuses</option><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="ARCHIVED">Archived</option></Select><Button type="submit"><Search className="h-4 w-4" />Search</Button></form></CardContent></Card>
    {products.isLoading ? <LoadingSkeleton /> : products.isError ? <ErrorState title="Products unavailable" description="Your product listings could not be loaded." onRetry={() => void products.refetch()} /> : !products.data?.data.length ? <EmptyState title="No products found" description="Add your first listing or adjust the current filters." action={<Button asChild><Link href="/farmer/products/new">Add Product</Link></Button>} /> : <div className="grid gap-4 xl:grid-cols-2">{products.data.data.map(product => {
      const available = product.inventory ? Number(product.inventory.quantityOnHand) - Number(product.inventory.quantityReserved) : 0;
      const image = product.images.find(item => item.isPrimary) ?? product.images[0];
      return <Card key={product.id} className="overflow-hidden"><CardContent className="flex flex-col gap-4 p-4 sm:flex-row">{image ? <Image src={image.url} alt={image.altText ?? product.name} width={144} height={112} unoptimized className="h-28 w-full rounded-xl object-cover sm:w-36" /> : <div className="flex h-28 w-full items-center justify-center rounded-xl bg-primary/10 text-sm text-primary sm:w-36">No image</div>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-semibold text-slate-900">{product.name}</h2><p className="text-sm text-slate-500">{product.category.name}</p></div><Badge variant={statusTone(product.status)}>{product.status}</Badge></div><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><p><span className="text-slate-500">Price:</span> {product.currency} {product.unitPrice}/{product.unit}</p><p><span className="text-slate-500">Available:</span> {available} {product.unit}</p></div><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="outline" asChild><Link href={`/farmer/products/${product.id}/edit`}><Edit3 className="h-4 w-4" />Edit</Link></Button><Button size="sm" variant="destructive" disabled={deletingId === product.id} onClick={() => void remove(product.id, product.name)}><Trash2 className="h-4 w-4" />{deletingId === product.id ? 'Archiving…' : 'Archive'}</Button></div></div></CardContent></Card>;
    })}</div>}
    {meta && meta.totalPages > 1 ? <nav aria-label="Product pagination" className="flex items-center justify-center gap-3"><Button variant="outline" disabled={meta.page <= 1} onClick={() => setQuery(current => ({ ...current, page: current.page! - 1 }))}>Previous</Button><span className="text-sm text-slate-600">Page {meta.page} of {meta.totalPages}</span><Button variant="outline" disabled={meta.page >= meta.totalPages} onClick={() => setQuery(current => ({ ...current, page: current.page! + 1 }))}>Next</Button></nav> : null}
    {toast ? <div onClick={() => setToast(null)}><ToastMessage message={toast.message} tone={toast.tone} /></div> : null}
  </div>;
}
