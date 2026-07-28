'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Bell, ChevronRight, Menu, MessageCircle, Search, Settings, ShoppingBag, Sparkles, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardShellProps {
  children: React.ReactNode;
}

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Buyer workspace', href: '/buyer' },
  { label: 'Farmer workspace', href: '/farmer' },
  { label: 'Transporter workspace', href: '/transporter' },
  { label: 'Admin workspace', href: '/admin' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Messages', href: '/dashboard/messages' },
  { label: 'Settings', href: '/dashboard/settings' },
];

function getBreadcrumbs(pathname: string) {
  const normalizedPath = pathname === '/' ? '/dashboard' : pathname;

  if (normalizedPath.startsWith('/buyer')) {
    return [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Buyer workspace' }];
  }

  if (normalizedPath.startsWith('/farmer')) {
    return [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Farmer workspace' }];
  }

  if (normalizedPath.startsWith('/transporter')) {
    return [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Transporter workspace' }];
  }

  if (normalizedPath.startsWith('/admin')) {
    return [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Admin workspace' }];
  }

  return [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Overview' }];
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const breadcrumbs = getBreadcrumbs(pathname);

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
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span>{item.label}</span>
                  {isActive ? <Sparkles className="h-4 w-4" /> : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="border-b border-border bg-white/90 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setIsMobileNavOpen((open) => !open)}>
                  <Menu className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 px-3 py-2 sm:min-w-[320px]">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input placeholder="Global search" className="border-0 bg-transparent shadow-none focus:ring-0" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => { setIsNotificationsOpen((open) => !open); setIsProfileOpen(false); }}>
                    <Bell className="h-4 w-4" />
                  </Button>
                  {isNotificationsOpen ? (
                    <div className="absolute right-0 z-10 mt-2 w-64 rounded-2xl border border-border bg-white p-3 shadow-lg">
                      <p className="mb-2 text-sm font-semibold text-slate-900">Notifications</p>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="rounded-xl bg-slate-50 p-2">New inventory from Green Valley Farms</div>
                        <div className="rounded-xl bg-slate-50 p-2">Delivery window changed for order #A104</div>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="relative">
                  <Button variant="outline" className="gap-2" onClick={() => { setIsProfileOpen((open) => !open); setIsNotificationsOpen(false); }}>
                    <UserCircle2 className="h-4 w-4" />
                    Profile
                  </Button>
                  {isProfileOpen ? (
                    <div className="absolute right-0 z-10 mt-2 w-48 rounded-2xl border border-border bg-white p-3 shadow-lg">
                      <p className="text-sm font-semibold text-slate-900">Amina Yusuf</p>
                      <p className="mt-1 text-sm text-slate-600">Buyer account</p>
                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2"><Settings className="h-4 w-4" /> Settings</div>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2"><MessageCircle className="h-4 w-4" /> Messages</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {isMobileNavOpen ? (
              <div className="border-t border-border bg-slate-50 px-4 py-3 lg:hidden">
                <div className="flex flex-col gap-2">
                  {navigationItems.map((item) => (
                    <Link key={item.label} href={item.href} className="rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {breadcrumbs.map((item, index) => (
                <div key={item.label} className="flex items-center gap-2">
                  {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
                  {item.href ? (
                    <Link href={item.href} className="font-medium text-slate-700 hover:text-primary">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-900">{item.label}</span>
                  )}
                </div>
              ))}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
