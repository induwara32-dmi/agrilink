import Link from 'next/link';
import { ArrowRight, Heart, MessageCircle, Star, Truck } from 'lucide-react';
import { MarketplaceShell } from '@/components/features/marketplace/marketplace-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { featuredProducts } from '@/components/features/marketplace/marketplace-data';

export default function ProductDetailsPage() {
  return (
    <MarketplaceShell title="Product details" description="Review product details, delivery options, and farmer information before buying.">
      <div className="space-y-6">
        <Card className="border-border/80 bg-white">
          <CardContent className="p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[2rem] border border-border bg-slate-50 p-8 text-center text-6xl">🥕</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Organic produce</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Organic Tomatoes</h2>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Add to wishlist">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm leading-7 text-slate-600">Fresh, pesticide-conscious tomatoes sourced from verified farms with reliable delivery.</p>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Star className="h-4 w-4 text-primary" /> 4.9 rating from 128 reviews
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button>Buy now</Button>
                  <Button variant="outline">Add to cart</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Farmer information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Green Valley Farms</p>
              <p>Verified farmer • Tamale • Next delivery in 6 hours</p>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" /> Contact seller
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Delivery options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 p-3">
                <Truck className="h-4 w-4 text-primary" /> Farmer delivery • same-day available
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-3">Buyer pickup • available at Tamale hub</div>
              <div className="rounded-2xl border border-border bg-slate-50 p-3">Transport partner • scheduled route support</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Related products</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {featuredProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{product.title}</p>
                <p className="mt-1 text-sm text-slate-600">{product.price}</p>
                <Link href="/marketplace/product" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  View details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MarketplaceShell>
  );
}
