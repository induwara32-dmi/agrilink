import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { CatalogGrid } from '@/components/features/marketplace/catalog-grid';
import { CategoryGrid } from '@/components/features/marketplace/category-grid';
import { MarketplaceShell } from '@/components/features/marketplace/marketplace-shell';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function MarketplacePage() {
  return (
    <MarketplaceShell title="Discover agricultural products and trusted suppliers" description="Browse featured products, explore categories, and find dependable farmers and delivery partners.">
      <section className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-900">Categories</h2><Link href="/marketplace/category" className="text-sm font-semibold text-primary">View all</Link></div>
        <CategoryGrid />
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-900">Featured products</h2><Link href="/marketplace/search" className="text-sm font-semibold text-primary">View more</Link></div>
        <Suspense fallback={<LoadingSkeleton />}><CatalogGrid featured /></Suspense>
      </section>
      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Marketplace</p><h2 className="mt-2 text-2xl font-semibold text-slate-900">A complete journey from discovery to delivery</h2></div>
          <Button asChild><Link href="/marketplace/search">Explore products <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>
    </MarketplaceShell>
  );
}
