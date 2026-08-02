'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search } from 'lucide-react';
import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { OrderCard } from '@/components/features/orders/order-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { listOrders, type OrderStatusCode } from '@/lib/api/commerce';

const statuses: Array<{ value?: OrderStatusCode; label: string }> = [{ label: 'All' }, { value: 'PENDING', label: 'Pending' }, { value: 'CONFIRMED', label: 'Confirmed' }, { value: 'PROCESSING', label: 'Processing' }, { value: 'PARTIALLY_FULFILLED', label: 'Partially fulfilled' }, { value: 'FULFILLED', label: 'Fulfilled' }, { value: 'CANCELLED', label: 'Cancelled' }];

function OrdersContent() {
  const [status, setStatus] = useState<OrderStatusCode | undefined>();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const orders = useQuery({ queryKey: ['orders', { page, search, status }], queryFn: () => listOrders({ page, pageSize: 10, ...(search ? { search } : {}), ...(status ? { status } : {}) }) });
  const items = orders.data?.data ?? [];
  const meta = orders.data?.meta;
  return <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Track and manage recent orders</CardTitle></CardHeader><CardContent className="space-y-6"><div className="flex flex-wrap gap-2">{statuses.map(option => <button key={option.label} type="button" onClick={() => { setStatus(option.value); setPage(1); }} className={`rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${status === option.value ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-700'}`}>{option.label}</button>)}</div><form className="flex flex-col gap-3 sm:flex-row" onSubmit={event => { event.preventDefault(); setSearch(searchInput.trim()); setPage(1); }}><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input aria-label="Search orders" value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Search by order, farmer, or product" className="pl-9" /></div><Button type="submit">Search</Button><Button type="button" variant="outline" onClick={() => { setSearchInput(''); setSearch(''); setStatus(undefined); setPage(1); }}>Reset</Button></form>
  {orders.isLoading ? <LoadingSkeleton /> : orders.isError ? <ErrorState title="Orders unavailable" description="We could not load your order history." onRetry={() => void orders.refetch()} /> : items.length ? <div className="space-y-4">{items.map(order => <OrderCard key={order.id} order={order} />)}</div> : <EmptyState title="No orders found" description="Try changing the search or status filter." />}
  {meta ? <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><p className="text-sm text-slate-600">Showing {items.length} of {meta.total} orders</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setPage(current => Math.max(current - 1, 1))} disabled={meta.page <= 1}>Prev</Button><span className="text-sm font-semibold text-slate-700">Page {meta.page} of {Math.max(meta.totalPages, 1)}</span><Button variant="outline" size="sm" onClick={() => setPage(current => current + 1)} disabled={meta.page >= meta.totalPages}>Next</Button></div></div> : null}</CardContent></Card>;
}

export default function OrdersPage() { return <ProtectedRoute roles={['BUYER', 'FARMER']}><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Orders</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">My orders</h1></div><Button asChild variant="outline"><Link href="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" /> Back to marketplace</Link></Button></div><OrdersContent /></main></ProtectedRoute>; }
