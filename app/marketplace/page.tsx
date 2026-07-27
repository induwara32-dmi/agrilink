import { Button } from '@/components/shared/button';

export default function MarketplacePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Marketplace
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Discover agricultural products and trusted suppliers.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          This route is ready for the first marketplace experience, including listings,
          search, filters, and seller detail views.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button>Browse listings</Button>
          <Button variant="outline">Create listing</Button>
        </div>
      </div>
    </main>
  );
}
