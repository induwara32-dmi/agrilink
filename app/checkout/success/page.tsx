import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { OrderSuccess } from '@/components/features/checkout/order-success';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function CheckoutSuccessPage() { return <ProtectedRoute role="BUYER"><main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Checkout</p><h1 className="mb-6 mt-2 text-3xl font-semibold tracking-tight text-slate-900">Thank you for your order</h1><Suspense fallback={<LoadingSkeleton />}><OrderSuccess /></Suspense></main></ProtectedRoute>; }
