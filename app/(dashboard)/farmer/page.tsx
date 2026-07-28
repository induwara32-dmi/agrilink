import { Bell, CheckCircle2, Leaf, Package, PlusCircle, ShoppingCart, TrendingUp, Truck, Users, Wallet } from 'lucide-react';
import { AnalyticsChart } from '@/components/features/dashboard/analytics-chart';
import { DataTable } from '@/components/features/dashboard/data-table';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const recentOrders = [
  { order: '#F102', item: 'Tomatoes', date: 'Today', status: 'Pending' },
  { order: '#F099', item: 'Maize', date: 'Today', status: 'Packed' },
  { order: '#F089', item: 'Cocoa', date: 'Yesterday', status: 'In Transit' },
];

const topProducts = [
  { name: 'Organic Tomatoes', stock: '180 kg', revenue: '$576' },
  { name: 'Fresh Maize', stock: '95 kg', revenue: '$171' },
  { name: 'Cocoa Beans', stock: '60 kg', revenue: '$306' },
];

const lowStock = [
  { item: 'Plantains', stock: '12 kg' },
  { item: 'Yam', stock: '8 kg' },
];

const deliveries = [
  { route: 'Tamale -> Accra', eta: '2h', status: 'Confirmed' },
  { route: 'Kumasi -> Sunyani', eta: '5h', status: 'Pending' },
];

const messages = [
  { buyer: 'Amina Yusuf', text: 'Can you reserve 50kg for Friday?' },
  { buyer: 'Daniel Osei', text: 'Need an update on the maize delivery.' },
];

const salesData = [
  { name: 'Mon', value: 24 },
  { name: 'Tue', value: 38 },
  { name: 'Wed', value: 31 },
  { name: 'Thu', value: 44 },
  { name: 'Fri', value: 53 },
  { name: 'Sat', value: 48 },
];

const revenueData = [
  { name: 'Jan', value: 2400 },
  { name: 'Feb', value: 2800 },
  { name: 'Mar', value: 3200 },
  { name: 'Apr', value: 3600 },
  { name: 'May', value: 4100 },
  { name: 'Jun', value: 4300 },
];

const inventoryData = [
  { name: 'Tomatoes', value: 180 },
  { name: 'Maize', value: 95 },
  { name: 'Cocoa', value: 60 },
  { name: 'Yam', value: 20 },
];

export default function FarmerDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Good morning</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, Kwame</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">Your farm operations look healthy today, with strong demand and a few high-priority orders to fulfill.</p>
          </div>
          <Button className="bg-white text-primary hover:bg-slate-50">View marketplace</Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Products" value="18" change="6 active listings" icon={<Package className="h-5 w-5" />} />
        <KPICard title="Available Stock" value="420 kg" change="+12% this week" icon={<Leaf className="h-5 w-5" />} />
        <KPICard title="Pending Orders" value="7" change="2 need confirmation" icon={<ShoppingCart className="h-5 w-5" />} />
        <KPICard title="Monthly Revenue" value="$8.2k" change="+18% vs last month" icon={<Wallet className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {([
              ['Add Product', <PlusCircle className="h-4 w-4" />],
              ['Update Stock', <Truck className="h-4 w-4" />],
              ['Accept Order', <CheckCircle2 className="h-4 w-4" />],
              ['Request Transport', <Truck className="h-4 w-4" />],
              ['View Analytics', <TrendingUp className="h-4 w-4" />],
            ] as Array<[string, React.ReactNode]>).map(([label, icon]) => (
              <Button key={label} variant="outline" className="justify-start">
                {icon}
                {label}
              </Button>
            ))}
          </div>

          <DataTable title="Recent Orders" columns={['Order', 'Item', 'Date', 'Status']} rows={recentOrders} />
          <DataTable title="Top Selling Products" columns={['Product', 'Stock', 'Revenue']} rows={topProducts} />
        </div>

        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.map((item) => (
                <div key={item.item} className="rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{item.item}</span>
                    <Badge variant="outline">{item.stock}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Upcoming Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deliveries.map((item) => (
                <div key={item.route} className="rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{item.route}</span>
                    <Badge variant="success">{item.status}</Badge>
                  </div>
                  <p className="mt-2">ETA {item.eta}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Buyer Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {messages.map((message) => (
                <div key={message.buyer} className="rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-slate-900">{message.buyer}</span>
                  </div>
                  <p className="mt-2">{message.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AnalyticsChart title="Sales" data={salesData} dataKey="value" color="#2E7D32" />
        <AnalyticsChart title="Revenue" data={revenueData} dataKey="value" color="#4F46E5" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3 text-sm">
                  <span className="font-semibold text-slate-900">{item.name}</span>
                  <span className="text-slate-600">{item.value} kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <AnalyticsChart title="Inventory" data={inventoryData} dataKey="value" color="#F59E0B" type="bar" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Weather Widget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3">
              <span className="font-semibold text-slate-900">Tamale</span>
              <span>28°C • Sunny</span>
            </div>
            <div className="rounded-2xl border border-border bg-slate-50 p-3">
              Ideal conditions for harvest and post-harvest handling.
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button className="justify-start">Add Product</Button>
            <Button variant="outline" className="justify-start">Update Stock</Button>
            <Button variant="outline" className="justify-start">Request Transport</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
