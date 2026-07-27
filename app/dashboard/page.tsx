import { CalendarDays, CheckCircle2, Heart, MapPin, MessageCircle, Package, ShoppingCart, TrendingUp, Truck, Users, Wallet, Bell } from 'lucide-react';
import { DashboardShell } from '@/components/features/dashboard/dashboard-shell';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { DataTable } from '@/components/features/dashboard/data-table';
import { MarketTrendChart } from '@/components/features/dashboard/market-trend-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const featuredProducts = [
  { name: 'Organic Tomatoes', farmer: 'Green Valley Farms', price: '$3.20/kg', status: 'In Stock' },
  { name: 'Fresh Maize', farmer: 'North Ridge Co-op', price: '$1.80/kg', status: 'Limited' },
  { name: 'Cocoa Beans', farmer: 'Riverland Collective', price: '$5.10/kg', status: 'Popular' },
];

const recentOrders = [
  { order: '#A104', item: 'Tomatoes', date: 'Today', status: 'Packed' },
  { order: '#A098', item: 'Maize', date: 'Yesterday', status: 'In Transit' },
  { order: '#A087', item: 'Cocoa', date: '2 days ago', status: 'Delivered' },
];

const farmers = [
  { name: 'Green Valley Farms', location: 'Tamale', rating: '4.9' },
  { name: 'North Ridge Co-op', location: 'Kumasi', rating: '4.8' },
  { name: 'Riverland Collective', location: 'Takoradi', rating: '4.7' },
];

export default function BuyerDashboardPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border/80 bg-gradient-to-br from-primary to-secondary p-0 text-white">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Good morning</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, Amina</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">Today’s marketplace summary shows strong demand for fresh produce and reliable transport options.</p>
                </div>
                <Button className="bg-white text-primary hover:bg-slate-50">Quick search</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Today’s focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">3 new offers</p>
                  <p className="text-sm text-slate-600">From preferred farmers</p>
                </div>
                <Badge variant="success">Hot</Badge>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600">
                Delivery window is open until 6:00 PM.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KPICard title="Available Products" value="84" change="+12% vs last week" icon={<Package className="h-5 w-5" />} />
          <KPICard title="Pending Orders" value="12" change="3 need confirmation" icon={<ShoppingCart className="h-5 w-5" />} />
          <KPICard title="Completed Orders" value="46" change="+8 this week" icon={<CheckCircle2 className="h-5 w-5" />} />
          <KPICard title="Favorite Farmers" value="9" change="2 new follows" icon={<Heart className="h-5 w-5" />} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <DataTable title="Featured Products" columns={['Product', 'Farmer', 'Price', 'Status']} rows={featuredProducts} />
            <DataTable title="Recent Orders" columns={['Order', 'Item', 'Date', 'Status']} rows={recentOrders} />
            <MarketTrendChart />
          </div>

          <div className="space-y-6">
            <Card className="border-border/80 bg-white">
              <CardHeader>
                <CardTitle>Recommended Farmers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {farmers.map((farmer) => (
                  <div key={farmer.name} className="rounded-2xl border border-border bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{farmer.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{farmer.location}</p>
                      </div>
                      <Badge variant="outline">★ {farmer.rating}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-white">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button className="justify-start">Browse marketplace</Button>
                <Button variant="outline" className="justify-start">View wishlist</Button>
                <Button variant="outline" className="justify-start">Open messages</Button>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-white">
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  'Shipment update for order #A104',
                  'New inventory from Green Valley Farms',
                  'Payment confirmation received',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                    <Bell className="mt-0.5 h-4 w-4 text-primary" /> {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Order Status Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Order received', 'Packed', 'Picked up', 'In transit', 'Delivered'].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 p-3">
                  <div className={`rounded-full p-2 ${index === 4 ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{step}</p>
                    <p className="text-sm text-slate-600">Updated recently</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Marketplace Categories</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {['Vegetables', 'Cereals', 'Fruits', 'Livestock'].map((category) => (
                <div key={category} className="rounded-2xl border border-border bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  {category}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}
