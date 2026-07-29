import { Activity, CheckCircle2, ClipboardList, DollarSign, Package, ShieldCheck, TrendingUp, Users, Warehouse } from 'lucide-react';
import { AnalyticsChart } from '@/components/features/dashboard/analytics-chart';
import { DataTable } from '@/components/features/dashboard/data-table';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const userRegistrations = [
  { name: 'Nadia Boateng', role: 'Buyer', date: 'Today' },
  { name: 'Yaw Adu', role: 'Farmer', date: 'Today' },
  { name: 'Mariam Issah', role: 'Transporter', date: 'Yesterday' },
];

const pendingFarmers = [
  { name: 'Kofi Mensah', status: 'Pending' },
  { name: 'Grace Tetteh', status: 'Review' },
];

const pendingTransporters = [
  { name: 'Samuel Boateng', status: 'Pending' },
  { name: 'Abena Osei', status: 'Review' },
];

const latestOrders = [
  { order: '#A120', buyer: 'Amina Yusuf', amount: '$320', status: 'Paid' },
  { order: '#A119', buyer: 'Daniel Osei', amount: '$180', status: 'Pending' },
];

const topCategories = [
  { category: 'Vegetables', sales: '214' },
  { category: 'Cereals', sales: '188' },
  { category: 'Logistics', sales: '96' },
];

const activities = [
  'New farmer verification request received',
  'Transporter route update submitted',
  'Category “Livestock” approved',
];

const revenueData = [
  { name: 'Jan', value: 6200 },
  { name: 'Feb', value: 7100 },
  { name: 'Mar', value: 7600 },
  { name: 'Apr', value: 8400 },
  { name: 'May', value: 9000 },
  { name: 'Jun', value: 9800 },
];

const orderData = [
  { name: 'Mon', value: 48 },
  { name: 'Tue', value: 54 },
  { name: 'Wed', value: 51 },
  { name: 'Thu', value: 63 },
  { name: 'Fri', value: 70 },
  { name: 'Sat', value: 67 },
];

const growthData = [
  { name: 'Jan', value: 120 },
  { name: 'Feb', value: 142 },
  { name: 'Mar', value: 161 },
  { name: 'Apr', value: 188 },
  { name: 'May', value: 213 },
  { name: 'Jun', value: 236 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">Your platform is growing steadily. Review approvals, monitor orders, and keep the marketplace healthy.</p>
          </div>
          <Button className="bg-white text-primary hover:bg-slate-50">View reports</Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Users" value="1,284" change="+9% this month" icon={<Users className="h-5 w-5" />} />
        <KPICard title="Active Farmers" value="186" change="12 pending approvals" icon={<Warehouse className="h-5 w-5" />} />
        <KPICard title="Pending Orders" value="34" change="5 urgent" icon={<ClipboardList className="h-5 w-5" />} />
        <KPICard title="Platform Revenue" value="$42.8k" change="+14% vs last month" icon={<DollarSign className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { label: 'Approve Farmer', icon: <ShieldCheck className="h-4 w-4" /> },
              { label: 'Approve Transporter', icon: <CheckCircle2 className="h-4 w-4" /> },
              { label: 'Add Category', icon: <Package className="h-4 w-4" /> },
              { label: 'View Reports', icon: <TrendingUp className="h-4 w-4" /> },
              { label: 'Manage Users', icon: <Users className="h-4 w-4" /> },
            ].map(({ label, icon }) => (
              <Button key={label} variant="outline" className="justify-start">
                {icon}
                {label}
              </Button>
            ))}
          </div>

          <DataTable title="Recent User Registrations" columns={['Name', 'Role', 'Date']} rows={userRegistrations} />
          <DataTable title="Pending Farmer Approvals" columns={['Name', 'Status']} rows={pendingFarmers} />
          <DataTable title="Pending Transporter Approvals" columns={['Name', 'Status']} rows={pendingTransporters} />
        </div>

        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Latest Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestOrders.map((order) => (
                <div key={order.order} className="rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{order.order}</span>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                  <p className="mt-2">{order.buyer} • {order.amount}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Top Selling Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topCategories.map((category) => (
                <div key={category.category} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{category.category}</span>
                  <span>{category.sales} sales</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.map((activity) => (
                <div key={activity} className="flex items-start gap-2 rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                  <Activity className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{activity}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AnalyticsChart title="Revenue" data={revenueData} dataKey="value" color="#4F46E5" />
        <AnalyticsChart title="Orders" data={orderData} dataKey="value" color="#2E7D32" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AnalyticsChart title="Monthly User Growth" data={growthData} dataKey="value" color="#F59E0B" />

        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3">
                <span className="font-semibold text-slate-900">Uptime</span>
                <span>99.98%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3">
                <span className="font-semibold text-slate-900">Response time</span>
                <span>142ms</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-border bg-slate-50 p-3">3 new farmer approvals pending</div>
              <div className="rounded-2xl border border-border bg-slate-50 p-3">2 route updates awaiting review</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
