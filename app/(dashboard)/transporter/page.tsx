import { CheckCircle2, Fuel, MapPinned, PackageCheck, Route, UserRound, Wallet } from 'lucide-react';
import { AnalyticsChart } from '@/components/features/dashboard/analytics-chart';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const jobs = [
  { route: 'Tamale → Accra', cargo: 'Fresh tomatoes', eta: '2h', status: 'Available' },
  { route: 'Kumasi → Sunyani', cargo: 'Maize sacks', eta: '4h', status: 'Available' },
  { route: 'Takoradi → Cape Coast', cargo: 'Cocoa beans', eta: '6h', status: 'Accepted' },
];

const timeline = [
  { step: 'Pickup confirmed', time: '08:00' },
  { step: 'Route in progress', time: '10:30' },
  { step: 'Warehouse handoff', time: '13:00' },
];

const history = [
  { route: 'Accra → Tema', status: 'Completed', earnings: '$320' },
  { route: 'Tamale → Bolgatanga', status: 'Completed', earnings: '$280' },
];

const vehicleStatus = [
  { label: 'Fuel level', value: '78%' },
  { label: 'Tire pressure', value: 'Optimal' },
  { label: 'Next service', value: 'In 10 days' },
];

const fuelData = [
  { name: 'Mon', value: 22 },
  { name: 'Tue', value: 24 },
  { name: 'Wed', value: 20 },
  { name: 'Thu', value: 26 },
  { name: 'Fri', value: 23 },
  { name: 'Sat', value: 25 },
];

const earningsData = [
  { name: 'Jan', value: 1800 },
  { name: 'Feb', value: 2100 },
  { name: 'Mar', value: 1950 },
  { name: 'Apr', value: 2450 },
  { name: 'May', value: 2600 },
  { name: 'Jun', value: 2900 },
];

const performanceData = [
  { name: 'On-time', value: 92 },
  { name: 'Completed', value: 88 },
  { name: 'Customer rating', value: 94 },
];

export default function TransporterDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Good morning</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, Kofi</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">Your route plan is strong today, with a few high-priority deliveries ready for pickup and handoff.</p>
          </div>
          <Button className="bg-white text-primary hover:bg-slate-50">Open route map</Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Available Jobs" value="6" change="3 urgent bookings" icon={<Route className="h-5 w-5" />} />
        <KPICard title="Accepted Deliveries" value="4" change="2 en route" icon={<PackageCheck className="h-5 w-5" />} />
        <KPICard title="Completed Deliveries" value="18" change="+7 this week" icon={<CheckCircle2 className="h-5 w-5" />} />
        <KPICard title="Monthly Earnings" value="$4.9k" change="+12% vs last month" icon={<Wallet className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Available Delivery Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs.map((job) => (
                <div key={job.route} className="flex flex-col gap-2 rounded-2xl border border-border bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{job.route}</p>
                    <p className="text-sm text-slate-600">{job.cargo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">ETA {job.eta}</Badge>
                    <Badge variant={job.status === 'Available' ? 'success' : 'outline'}>{job.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Today&apos;s Route</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                <MapPinned className="h-4 w-4 text-primary" />
                <span className="font-semibold text-slate-900">Tamale → Accra</span>
                <span className="ml-auto">5 stops</span>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                Estimated arrival window: 16:00 – 18:00
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Delivery Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeline.map((item) => (
                <div key={item.step} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{item.step}</span>
                  <span>{item.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Delivery History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map((item) => (
                <div key={item.route} className="rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{item.route}</span>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                  <p className="mt-2">Earnings {item.earnings}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Vehicle Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicleStatus.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Customer Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                <UserRound className="h-4 w-4 text-primary" />
                <span className="font-semibold text-slate-900">Amina Yusuf</span>
              </div>
              <p className="text-sm text-slate-600">Please confirm the pickup time for the tomato shipment.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AnalyticsChart title="Weekly Deliveries" data={fuelData} dataKey="value" color="#2E7D32" />
        <AnalyticsChart title="Monthly Earnings" data={earningsData} dataKey="value" color="#4F46E5" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceData.map((item) => (
                <div key={item.name} className="rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{item.name}</span>
                    <span>{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button className="justify-start">Accept Job</Button>
            <Button variant="outline" className="justify-start">Start Delivery</Button>
            <Button variant="outline" className="justify-start">Update Delivery Status</Button>
            <Button variant="outline" className="justify-start">View Route</Button>
            <Button variant="outline" className="justify-start">View Earnings</Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Fuel Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3">
              <span className="font-semibold text-slate-900">Fuel reserve</span>
              <span>78%</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 p-3">
              <Fuel className="h-4 w-4 text-primary" />
              <span>Next refill planned at 20:00</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Ratings Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3">
              <span className="font-semibold text-slate-900">Overall rating</span>
              <span>4.9/5</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3">
              <span className="font-semibold text-slate-900">On-time score</span>
              <span>92%</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
