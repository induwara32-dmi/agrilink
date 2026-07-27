import { Bell, MessageCircle, Search, Settings, ShoppingBag, Sparkles, UserCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-border bg-white lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">AgriLink</p>
              <p className="text-sm text-slate-500">Buyer workspace</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

          <nav className="space-y-1 px-3 pb-6">
            {[
              ['Dashboard', 'dashboard'],
              ['Marketplace', 'marketplace'],
              ['My Orders', 'orders'],
              ['Wishlist', 'wishlist'],
              ['Payments', 'payments'],
              ['Messages', 'messages'],
              ['Notifications', 'notifications'],
              ['Profile', 'profile'],
              ['Settings', 'settings'],
            ].map(([label, active]) => (
              <button key={label} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${active === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                <span>{label}</span>
                {active === 'dashboard' ? <Sparkles className="h-4 w-4" /> : null}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="border-b border-border bg-white/90 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 px-3 py-2 sm:min-w-[320px]">
                <Search className="h-4 w-4 text-slate-400" />
                <Input placeholder="Global search" className="border-0 bg-transparent shadow-none focus:ring-0" />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Messages">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="gap-2">
                  <UserCircle2 className="h-4 w-4" />
                  Profile
                </Button>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
