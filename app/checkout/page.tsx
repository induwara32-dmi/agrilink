"use client";

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, ChevronRight, CreditCard, MapPin, PackageCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const steps = ['Delivery Information', 'Delivery Method', 'Payment', 'Review Order', 'Success'];

const products = [
  { name: 'Organic Tomatoes', price: '$6.40' },
  { name: 'Fresh Maize', price: '$1.80' },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('Farmer Delivery');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const nextStep = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const prevStep = () => setStep((current) => Math.max(current - 1, 0));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Checkout</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Complete your order</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/marketplace">Continue shopping</Link>
        </Button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {steps.map((label, index) => {
          const isActive = index === step;
          const isComplete = index < step;
          return (
            <div key={label} className={`rounded-full px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary text-primary-foreground' : isComplete ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-600'}`}>
              {index + 1}. {label}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {step === 0 && (
            <Card className="border-border/80 bg-white">
              <CardHeader>
                <CardTitle>Step 1 • Delivery information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Input placeholder="Receiver name" />
                <Input placeholder="Phone number" />
                <Input placeholder="District" />
                <Input placeholder="Address" />
                <div className="md:col-span-2">
                  <Input placeholder="Delivery notes" />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card className="border-border/80 bg-white">
              <CardHeader>
                <CardTitle>Step 2 • Delivery method</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {['Farmer Delivery', 'Buyer Pickup', 'Transport Partner'].map((method) => (
                  <button key={method} onClick={() => setSelectedMethod(method)} className={`rounded-2xl border p-4 text-left text-sm ${selectedMethod === method ? 'border-primary bg-primary/5 text-slate-900' : 'border-border bg-slate-50 text-slate-600'}`}>
                    <div className="flex items-center gap-2 font-semibold">
                      <Truck className="h-4 w-4 text-primary" /> {method}
                    </div>
                    <p className="mt-2">Mock route plan for planning purposes.</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-border/80 bg-white">
              <CardHeader>
                <CardTitle>Step 3 • Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  {['Cash on Delivery', 'Card', 'Bank Transfer'].map((option) => (
                    <button key={option} onClick={() => setPaymentMethod(option)} className={`rounded-2xl border p-4 text-left text-sm ${paymentMethod === option ? 'border-primary bg-primary/5 text-slate-900' : 'border-border bg-slate-50 text-slate-600'}`}>
                      <div className="flex items-center gap-2 font-semibold">
                        <CreditCard className="h-4 w-4 text-primary" /> {option}
                      </div>
                    </button>
                  ))}
                </div>
                <Input placeholder="Promo code" />
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-border/80 bg-white">
              <CardHeader>
                <CardTitle>Step 4 • Review order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Delivery</p>
                  <p className="mt-2">Receiver: Amina Yusuf • Tamale • {selectedMethod}</p>
                </div>
                <div className="rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Items</p>
                  {products.map((product) => (
                    <div key={product.name} className="mt-2 flex items-center justify-between">
                      <span>{product.name}</span>
                      <span>{product.price}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Payment</p>
                  <p className="mt-2">{paymentMethod}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="border-border/80 bg-white">
              <CardHeader>
                <CardTitle>Step 5 • Order placed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <CheckCircle2 className="h-5 w-5 text-success" /> Order confirmed
                </div>
                <p>Order number: AG-48291</p>
                <p>Estimated delivery: 2-6 hours</p>
                <div className="flex flex-wrap gap-3">
                  <Button>Track order</Button>
                  <Button asChild variant="outline">
                    <Link href="/marketplace">Continue shopping</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={prevStep} disabled={step === 0 || step === 4}>
              Back
            </Button>
            <Button onClick={nextStep} disabled={step === 4}>
              {step === 3 ? 'Place order' : 'Continue'} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>$8.20</span></div>
              <div className="flex items-center justify-between"><span>Delivery fee</span><span>$2.50</span></div>
              <div className="flex items-center justify-between"><span>Discount</span><span>-$1.00</span></div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-slate-900"><span>Grand total</span><span>$9.70</span></div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Delivery info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Tamale district</div>
              <div className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-primary" /> 2 products selected</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
