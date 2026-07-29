import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { OrderDetails } from '@/components/features/orders/order-details';
import { Button } from '@/components/ui/button';

export default async function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) { const { orderId } = await params; return <ProtectedRoute role="BUYER"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Order details</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Order overview</h1></div><Button asChild variant="outline"><Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" /> Back to orders</Link></Button></div><OrderDetails orderId={orderId} /></main></ProtectedRoute>; }
