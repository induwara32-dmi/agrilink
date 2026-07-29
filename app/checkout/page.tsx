'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ChevronRight, CreditCard, MapPin, PackageCheck, Truck } from 'lucide-react';
import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ApiClientError } from '@/lib/api/client';
import { cartQueryKeys, checkout, getCart, previewCheckout, type CheckoutGroupInput, type DeliveryMethodCode } from '@/lib/api/commerce';

const steps = ['Delivery Information', 'Delivery Method', 'Payment', 'Review Order'];
const deliveryMethods: Array<{ code: DeliveryMethodCode; label: string; description: string }> = [
  { code: 'FARMER_DELIVERY', label: 'Farmer Delivery', description: 'The farmer delivers this group.' },
  { code: 'BUYER_PICKUP', label: 'Buyer Pickup', description: 'Collect this group from the farmer.' },
  { code: 'PLATFORM_TRANSPORTER', label: 'Platform Transporter', description: 'AgriLink assigns a transport partner.' },
];
const paymentProviders = [{ value: 'cash_on_delivery', label: 'Cash on Delivery' }, { value: 'card', label: 'Card' }, { value: 'bank_transfer', label: 'Bank Transfer' }];
type DeliveryForm = { recipientName: string; recipientPhone: string; line1: string; city: string; district: string; region: string; countryCode: string; buyerNotes: string };
const initialDelivery: DeliveryForm = { recipientName: '', recipientPhone: '', line1: '', city: '', district: '', region: '', countryCode: 'GH', buyerNotes: '' };
function money(value: string, currency: string) { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(value)); }

function CheckoutContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState(initialDelivery);
  const [methods, setMethods] = useState<Record<string, DeliveryMethodCode>>({});
  const [paymentProvider, setPaymentProvider] = useState('cash_on_delivery');
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [validationError, setValidationError] = useState<string | null>(null);
  const cart = useQuery({ queryKey: cartQueryKeys.current(), queryFn: getCart });
  const groups = useMemo(() => cart.data?.data.groups ?? [], [cart.data?.data.groups]);
  const checkoutGroups = useMemo<CheckoutGroupInput[]>(() => groups.map(group => {
    const method = methods[group.farmer.id] ?? 'FARMER_DELIVERY';
    return { farmerId: group.farmer.id, deliveryMethod: method, ...(method !== 'BUYER_PICKUP' ? { deliveryAddress: { recipientName: delivery.recipientName, recipientPhone: delivery.recipientPhone, line1: delivery.line1, city: delivery.city, ...(delivery.district ? { district: delivery.district } : {}), ...(delivery.region ? { region: delivery.region } : {}), countryCode: delivery.countryCode }, ...(delivery.buyerNotes ? { buyerNotes: delivery.buyerNotes } : {}) } : {}) };
  }), [delivery, groups, methods]);
  const preview = useQuery({ queryKey: cartQueryKeys.preview({ checkoutGroups, couponCode }), queryFn: () => previewCheckout(checkoutGroups, couponCode), enabled: groups.length > 0 });
  const submit = useMutation({ mutationFn: () => checkout(checkoutGroups, paymentProvider, couponCode), onSuccess: async response => { await queryClient.invalidateQueries({ queryKey: cartQueryKeys.all }); router.replace(`/checkout/success?orderId=${encodeURIComponent(response.data.id)}`); }, onError: error => setValidationError(error instanceof ApiClientError ? error.message : 'Unable to place your order.') });

  if (cart.isLoading) return <LoadingSkeleton />;
  if (cart.isError) return <ErrorState title="Checkout unavailable" description="We could not load your current cart." onRetry={() => void cart.refetch()} />;
  if (!groups.length) return <EmptyState title="Your cart is empty" description="Add products before starting checkout." action={<Button asChild><Link href="/marketplace">Browse marketplace</Link></Button>} />;
  const totals = preview.data?.data;

  function continueStep() {
    setValidationError(null);
    if (step === 0 && (!delivery.recipientName || !delivery.recipientPhone || !delivery.line1 || !delivery.city || delivery.countryCode.length !== 2)) { setValidationError('Complete the required delivery information.'); return; }
    if (step === 2 && !totals) { setValidationError(preview.error instanceof ApiClientError ? preview.error.message : 'Validate checkout totals before reviewing the order.'); void preview.refetch(); return; }
    setStep(current => Math.min(current + 1, steps.length - 1));
  }
  function applyCoupon() { const nextCoupon = couponInput.trim().toUpperCase() || undefined; setValidationError(null); setCouponCode(nextCoupon); }

  return <><div className="mb-8 flex flex-wrap gap-2">{steps.map((label, index) => <div key={label} className={`rounded-full px-3 py-2 text-sm font-medium ${index === step ? 'bg-primary text-primary-foreground' : index < step ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-600'}`}>{index + 1}. {label}</div>)}</div>
  <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><div className="space-y-6">
    {step === 0 ? <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Step 1 · Delivery information</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><Input aria-label="Receiver name" required placeholder="Receiver name" value={delivery.recipientName} onChange={event => setDelivery({ ...delivery, recipientName: event.target.value })} /><Input aria-label="Phone number" required placeholder="Phone number" value={delivery.recipientPhone} onChange={event => setDelivery({ ...delivery, recipientPhone: event.target.value })} /><Input aria-label="City" required placeholder="City" value={delivery.city} onChange={event => setDelivery({ ...delivery, city: event.target.value })} /><Input aria-label="Address" required placeholder="Address" value={delivery.line1} onChange={event => setDelivery({ ...delivery, line1: event.target.value })} /><Input aria-label="District" placeholder="District" value={delivery.district} onChange={event => setDelivery({ ...delivery, district: event.target.value })} /><Input aria-label="Region" placeholder="Region" value={delivery.region} onChange={event => setDelivery({ ...delivery, region: event.target.value })} /><Input aria-label="Country code" required maxLength={2} placeholder="Country code" value={delivery.countryCode} onChange={event => setDelivery({ ...delivery, countryCode: event.target.value.toUpperCase() })} /><Input aria-label="Delivery notes" placeholder="Delivery notes" value={delivery.buyerNotes} onChange={event => setDelivery({ ...delivery, buyerNotes: event.target.value })} /></CardContent></Card> : null}
    {step === 1 ? <div className="space-y-4">{groups.map(group => <Card key={group.farmer.id} className="border-border/80 bg-white"><CardHeader><CardTitle>{group.farmer.farmName}</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{deliveryMethods.map(method => <button type="button" key={method.code} aria-pressed={methods[group.farmer.id] === method.code} onClick={() => setMethods({ ...methods, [group.farmer.id]: method.code })} className={`rounded-2xl border p-4 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${methods[group.farmer.id] === method.code ? 'border-primary bg-primary/5 text-slate-900' : 'border-border bg-slate-50 text-slate-600'}`}><div className="flex items-center gap-2 font-semibold"><Truck className="h-4 w-4 text-primary" /> {method.label}</div><p className="mt-2">{method.description}</p></button>)}</CardContent></Card>)}</div> : null}
    {step === 2 ? <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Step 3 · Payment and coupon</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-3">{paymentProviders.map(option => <button type="button" key={option.value} aria-pressed={paymentProvider === option.value} onClick={() => setPaymentProvider(option.value)} className={`rounded-2xl border p-4 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${paymentProvider === option.value ? 'border-primary bg-primary/5 text-slate-900' : 'border-border bg-slate-50 text-slate-600'}`}><div className="flex items-center gap-2 font-semibold"><CreditCard className="h-4 w-4 text-primary" /> {option.label}</div></button>)}</div><div className="flex flex-col gap-3 sm:flex-row"><Input aria-label="Coupon code" placeholder="Coupon code" value={couponInput} onChange={event => setCouponInput(event.target.value)} /><Button type="button" variant="outline" disabled={preview.isPending} onClick={applyCoupon}>{preview.isPending ? 'Validating…' : 'Apply coupon'}</Button></div>{couponCode && totals ? <p className="text-sm text-success">Coupon {couponCode} applied.</p> : null}</CardContent></Card> : null}
    {step === 3 ? <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Step 4 · Review order</CardTitle></CardHeader><CardContent className="space-y-4">{groups.map(group => { const groupTotal = totals?.groups.find(total => total.farmerId === group.farmer.id); return <div key={group.farmer.id} className="rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600"><p className="font-semibold text-slate-900">{group.farmer.farmName}</p>{group.items.map(item => <div key={item.id} className="mt-2 flex items-center justify-between gap-3"><span>{item.product.name} × {item.quantity}</span><span>{money(String(Number(item.product.unitPrice) * Number(item.quantity)), item.product.currency)}</span></div>)}{groupTotal ? <div className="mt-3 border-t border-border pt-3"><div className="flex justify-between"><span>Proportional discount</span><span>-{money(groupTotal.discountTotal, totals!.currency)}</span></div><div className="flex justify-between font-semibold text-slate-900"><span>Group total</span><span>{money(groupTotal.total, totals!.currency)}</span></div></div> : null}</div>; })}</CardContent></Card> : null}
      {validationError || preview.isError ? <p role="alert" className="rounded-2xl bg-danger/10 p-4 text-sm text-danger">{validationError ?? (preview.error instanceof ApiClientError ? preview.error.message : 'Unable to calculate checkout totals.')}</p> : null}
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="outline" onClick={() => setStep(current => Math.max(current - 1, 0))} disabled={step === 0 || submit.isPending}>Back</Button>{step < 3 ? <Button onClick={continueStep}>Continue <ChevronRight className="h-4 w-4" /></Button> : <Button disabled={submit.isPending || !totals} onClick={() => submit.mutate()}>{submit.isPending ? 'Placing order…' : 'Place order'} {!submit.isPending ? <ChevronRight className="h-4 w-4" /> : null}</Button>}</div>
  </div><aside className="space-y-6"><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Order summary</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600">{totals ? <><div className="flex justify-between"><span>Subtotal</span><span>{money(totals.subtotal, totals.currency)}</span></div><div className="flex justify-between"><span>Delivery fees</span><span>{money(totals.deliveryFee, totals.currency)}</span></div><div className="flex justify-between"><span>Discount</span><span>-{money(totals.discountTotal, totals.currency)}</span></div><div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-slate-900"><span>Grand total</span><span>{money(totals.grandTotal, totals.currency)}</span></div></> : <p>{preview.isPending ? 'Calculating secure totals…' : 'Totals will be validated by the server.'}</p>}</CardContent></Card><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Delivery info</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {delivery.city || 'Delivery city pending'}</div><div className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-primary" /> {groups.reduce((count, group) => count + group.items.length, 0)} products selected</div></CardContent></Card></aside></div></>;
}

export default function CheckoutPage() { return <ProtectedRoute role="BUYER"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Checkout</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Complete your order</h1></div><Button asChild variant="outline"><Link href="/marketplace">Continue shopping</Link></Button></div><CheckoutContent /></main></ProtectedRoute>; }
