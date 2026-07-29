'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ORDER_STATUS_OPTIONS, mockOrders } from '@/components/features/orders/order-data';
import { OrderCard } from '@/components/features/orders/order-card';

const ordersPerPage = 4;

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<(typeof ORDER_STATUS_OPTIONS)[number]>('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const matches = mockOrders.filter((order) => {
      const statusMatches = activeTab === 'All' || order.status === activeTab;
      const searchQuery = search.trim().toLowerCase();
      const searchMatches =
        searchQuery.length === 0 ||
        [order.orderNumber, order.farmer.name, order.location, order.deliveryMethod].some((value) => value.toLowerCase().includes(searchQuery));
      return statusMatches && searchMatches;
    });

    matches.sort((first, second) => {
      if (sortBy === 'amount') {
        const firstValue = Number(first.total.replace(/[^\d.]/g, ''));
        const secondValue = Number(second.total.replace(/[^\d.]/g, ''));
        return secondValue - firstValue;
      }

      const firstDate = new Date(first.createdAt).getTime();
      const secondDate = new Date(second.createdAt).getTime();
      return sortBy === 'oldest' ? firstDate - secondDate : secondDate - firstDate;
    });

    return matches;
  }, [activeTab, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const safePage = Math.min(page, totalPages);
  const visibleOrders = filteredOrders.slice((safePage - 1) * ordersPerPage, safePage * ordersPerPage);

  const handleReset = () => {
    setActiveTab('All');
    setSearch('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Orders</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">My orders</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to marketplace
          </Link>
        </Button>
      </div>

      <Card className="border-border/80 bg-white">
        <CardHeader>
          <CardTitle>Track and manage recent orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setActiveTab(status)}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${activeTab === status ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-700'}`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.4fr_0.3fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by order, farmer, or location" className="pl-9" />
            </div>
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="pl-9">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="amount">Highest amount</option>
              </Select>
            </div>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>

          {visibleOrders.length === 0 ? (
            <EmptyState title="No orders match the current filters." description="Try changing the search or status selection to find more orders." />
          ) : (
            <div className="space-y-4">
              {visibleOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-slate-600">Showing {visibleOrders.length} of {filteredOrders.length} orders</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={safePage === 1}>
                Prev
              </Button>
              <span className="text-sm font-semibold text-slate-700">Page {safePage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.min(current + 1, totalPages))} disabled={safePage === totalPages}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
