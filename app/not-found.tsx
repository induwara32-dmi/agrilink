import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full border-border/80 bg-white">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <SearchX className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">Page not found</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            The route you requested is unavailable or may have moved. Return to the marketplace or dashboard to continue exploring AgriLink.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/marketplace">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to marketplace
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
