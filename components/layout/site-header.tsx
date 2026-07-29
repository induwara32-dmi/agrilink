'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteNavItems } from '@/components/layout/navigation-data';

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="rounded-full bg-primary/10 p-2 text-primary">
            <Leaf className="h-4 w-4" />
          </span>
          <span>AgriLink</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-2 md:flex">
          {siteNavItems.map((item) => {
            const isActive = pathname === item.href || pathname === item.href.replace('/#', '#');
            return (
              <Button key={item.label} variant="ghost" asChild className={isActive ? 'bg-accent text-primary' : ''}>
                <Link href={item.href} aria-current={isActive ? 'page' : undefined}>
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/marketplace">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
