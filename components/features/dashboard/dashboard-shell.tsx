'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Bell, ChevronRight, Menu, Search, ShoppingBag, Sparkles, UserCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboardNavItems } from '@/components/layout/navigation-data';
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { NotificationPanel } from '@/components/features/notifications/notification-panel';
import { getUnreadCount, notificationQueryKeys } from '@/lib/api/notifications';

interface DashboardShellProps {
  children: React.ReactNode;
}

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
  const { user, logout } = useAuth();
  const displayName = user?.profile?.displayName || [user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(' ') || user?.email;
  const unread = useQuery({ queryKey: notificationQueryKeys.unread(), queryFn: getUnreadCount, enabled: Boolean(user), refetchInterval: 60_000 });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden w-72 border-r border-border bg-white lg:block">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">AgriLink</p>
              <p className="text-sm text-slate-500">Buyer workspace</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

          <nav className="space-y-1 px-3 pb-6" aria-label="Dashboard navigation">
            {dashboardNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span>{item.label}</span>
                  {isActive ? <Sparkles className="h-4 w-4" /> : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-border bg-white/90 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" aria-label="Open navigation" aria-expanded={isMobileNavOpen} aria-controls="mobile-dashboard-navigation" onClick={() => setIsMobileNavOpen((open) => !open)}>
                  <Menu className="h-4 w-4" />
                </Button>
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-slate-50 px-3 py-2 sm:min-w-[320px]">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input aria-label="Search dashboard" placeholder="Global search" className="border-0 bg-transparent shadow-none focus:ring-0" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button variant="ghost" size="icon" aria-label="Notifications" aria-expanded={isNotificationsOpen} onClick={() => { setIsNotificationsOpen((open) => !open); setIsProfileOpen(false); }}>
                    <Bell className="h-4 w-4" />
                    {(unread.data?.data.count ?? 0) > 0 ? <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] text-white">{unread.data!.data.count > 99 ? '99+' : unread.data!.data.count}</span> : null}
                  </Button>
                  {isNotificationsOpen ? (
                    <div className="absolute right-0 z-10 mt-2 max-h-[70vh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-border bg-white p-3 shadow-lg">
                      <p className="mb-2 text-sm font-semibold text-slate-900">Notifications</p>
                      <NotificationPanel compact />
                    </div>
                  ) : null}
                </div>
                <div className="relative">
                  <Button variant="outline" className="gap-2" aria-expanded={isProfileOpen} onClick={() => { setIsProfileOpen((open) => !open); setIsNotificationsOpen(false); }}>
                    <UserCircle2 className="h-4 w-4" />
                    Profile
                  </Button>
                  {isProfileOpen ? (
                    <div className="absolute right-0 z-10 mt-2 w-48 rounded-2xl border border-border bg-white p-3 shadow-lg">
                      <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                      <p className="mt-1 text-sm capitalize text-slate-600">{user?.role.toLowerCase()} account</p>
                      <Button variant="ghost" className="mt-2 w-full justify-start" onClick={() => void logout().then(() => window.location.assign('/auth/sign-in'))}>
                        Sign out
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {isMobileNavOpen ? (
              <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setIsMobileNavOpen(false)}>
                <div id="mobile-dashboard-navigation" role="dialog" aria-modal="true" aria-label="Dashboard navigation" className="h-full w-72 max-w-[85vw] overflow-y-auto border-r border-border bg-white p-4 shadow-xl" onClick={(event) => event.stopPropagation()}>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Menu</p>
                    <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setIsMobileNavOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {dashboardNavItems.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link key={item.label} href={item.href} aria-current={isActive ? 'page' : undefined} onClick={() => setIsMobileNavOpen(false)} className={`rounded-2xl px-3 py-2 text-sm font-medium shadow-sm ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-700'}`}>
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
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
