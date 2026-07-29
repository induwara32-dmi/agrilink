import Link from 'next/link';
import { Minus, Plus, Trash2, Truck } from 'lucide-react';
import { ProductCard } from '@/components/features/marketplace/product-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { featuredProducts } from '@/components/features/marketplace/marketplace-data';
import { DELIVERY_METHODS } from '@/config/domain';

const cartItems = featuredProducts.slice(0, 2).map((product, index) => ({
  ...product,
  quantity: index === 0 ? 2 : 1,
  delivery: DELIVERY_METHODS[index],
}));

export default function CartPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Cart</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Your shopping cart</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/marketplace">Continue shopping</Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Items grouped by farmer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-border bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.farmer}</p>
                      <p className="mt-2 text-sm font-semibold text-primary">{item.price}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-2xl border border-border bg-white px-2 py-2">
                        <Button variant="ghost" size="icon" aria-label="Decrease quantity">
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-8 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                        <Button variant="ghost" size="icon" aria-label="Increase quantity">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">Save for later</Button>
                      <Button variant="ghost" size="icon" aria-label="Remove item">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Delivery method</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {DELIVERY_METHODS.map((option) => (
                <div key={option} className="rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Truck className="h-4 w-4 text-primary" /> {option}
                  </div>
                  <p className="mt-2">Mock delivery option for planning purposes.</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Estimated delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-border bg-slate-50 p-3">Same-day dispatch available for selected items</div>
              <div className="rounded-2xl border border-border bg-slate-50 p-3">Estimated arrival: 2-6 hours depending on route</div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Coupon code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Input placeholder="Enter coupon" />
              <Button>Apply</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>$8.20</span></div>
              <div className="flex items-center justify-between"><span>Delivery fee</span><span>$2.50</span></div>
              <div className="flex items-center justify-between"><span>Discount</span><span>-$1.00</span></div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-slate-900"><span>Total</span><span>$9.70</span></div>
              <Button asChild className="w-full"><Link href="/checkout">Checkout</Link></Button>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Recommended products</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {featuredProducts.slice(0, 2).map((product) => (
                <ProductCard key={product.id} id={product.id} title={product.title} price={product.price} farmer={product.farmer} location={product.location} rating={product.rating} badge={product.badge} />
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Empty cart state</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>Your cart is ready for new selections. Add items to see them grouped here.</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/marketplace">Browse marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
