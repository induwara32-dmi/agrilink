import Link from 'next/link';
import { ArrowLeft, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full border-border/80 bg-white">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-warning">
            <PackageX className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">Order not found</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">This order could not be located. Double-check the ID or return to your order list.</p>
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/orders">
                <ArrowLeft className="mr-2 h-4 w-4" /> View all orders
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
