'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface MarketplaceShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function MarketplaceShell({ title, description, children }: MarketplaceShellProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(search.trim() ? `/marketplace/search?search=${encodeURIComponent(search.trim())}` : '/marketplace/search');
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Marketplace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-white text-primary hover:bg-slate-50"><Link href="/marketplace/search">Browse listings</Link></Button>
            <Button variant="outline" disabled title="Listing creation is not available in this release" className="border-white/40 bg-transparent text-white hover:bg-white/10">Create listing</Button>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={submitSearch} className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <Input aria-label="Search marketplace" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, farmers, or categories" className="border-0 bg-transparent shadow-none focus:ring-0" />
          </form>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/marketplace/search">
              <Filter className="h-4 w-4" /> Filters
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/marketplace/search?sort=priceAsc">
              <SlidersHorizontal className="h-4 w-4" /> Sort
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">{children}</div>
        <aside className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Trending</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Fresh produce', 'Bulk grains', 'Cold chain'].map((tag) => (
                <Badge key={tag} variant="outline" className="mr-2">
                  {tag}
                </Badge>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Quick links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/marketplace" className="block rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">Marketplace home</Link>
              <Link href="/marketplace/category" className="block rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">Categories</Link>
              <Link href="/marketplace/wishlist" className="block rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">Wishlist</Link>
              <Link href="/marketplace/recently-viewed" className="block rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">Recently Viewed</Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
