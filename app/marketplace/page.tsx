import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketplaceShell } from '@/components/features/marketplace/marketplace-shell';
import { CategoryCard } from '@/components/features/marketplace/category-card';
import { ProductCard } from '@/components/features/marketplace/product-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categories, featuredProducts, flashDeals, nearbyFarmers, seasonalProducts, trendingProducts } from '@/components/features/marketplace/marketplace-data';

export default function MarketplacePage() {
  return (
    <MarketplaceShell title="Discover agricultural products and trusted suppliers" description="Browse featured products, explore categories, and find dependable farmers and delivery partners.">
      <section className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <CategoryCard key={category.name} name={category.name} description={category.description} image={category.image} />
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Featured products</h2>
          <Link href="/marketplace/search" className="text-sm font-semibold text-primary">View more</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} title={product.title} price={product.price} farmer={product.farmer} location={product.location} rating={product.rating} badge={product.badge} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Trending products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingProducts.map((product) => (
              <div key={product.title} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{product.title}</span>
                <span>{product.price} • {product.change}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Nearby farmers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearbyFarmers.map((farmer) => (
              <div key={farmer.name} className="rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{farmer.name}</span>
                  <span>{farmer.rating} ★</span>
                </div>
                <p className="mt-2">{farmer.location}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Seasonal products</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {seasonalProducts.map((product) => (
              <div key={product.title} className="rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{product.title}</p>
                <p className="mt-2">{product.price}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Flash deals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {flashDeals.map((deal) => (
              <div key={deal.title} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-900">{deal.title}</p>
                  <p>{deal.note}</p>
                </div>
                <span className="font-semibold text-primary">{deal.price}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">New experience</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">A complete marketplace journey from discovery to delivery</h2>
          </div>
          <Button asChild>
            <Link href="/marketplace/product">
              Explore a product <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </MarketplaceShell>
  );
}
