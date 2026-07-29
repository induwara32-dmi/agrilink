'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Minus, Plus, Trash2, Truck } from 'lucide-react';
import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ApiClientError } from '@/lib/api/client';
import { cartQueryKeys, clearCart, getCart, removeCartItem, saveCartItem, updateCartItem, type CartItem } from '@/lib/api/commerce';

function money(value: string, currency: string | null) { return currency ? new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(value)) : value; }

function CartContent() {
  const client = useQueryClient();
  const cart = useQuery({ queryKey: cartQueryKeys.current(), queryFn: getCart });
  const mutation = useMutation({
    mutationFn: async (action: { type: 'update'; item: CartItem; quantity: number } | { type: 'save'; item: CartItem } | { type: 'restore'; item: CartItem } | { type: 'remove'; item: CartItem } | { type: 'clear' }) => {
      if (action.type === 'clear') return clearCart();
      if (action.type === 'remove') return removeCartItem(action.item.id);
      if (action.type === 'save') return saveCartItem(action.item.id);
      if (action.type === 'restore') return updateCartItem(action.item.id, { savedForLater: false });
      return updateCartItem(action.item.id, { quantity: String(action.quantity) });
    },
    onSuccess: async (response) => {
      if ('groups' in response.data) client.setQueryData(cartQueryKeys.current(), response);
      else await client.invalidateQueries({ queryKey: cartQueryKeys.all });
    },
  });
  if (cart.isLoading) return <LoadingSkeleton />;
  if (cart.isError) return <ErrorState title="Cart unavailable" description="We could not load your cart." onRetry={() => void cart.refetch()} />;
  const data = cart.data?.data;
  if (!data) return null;
  const activeCount = data.groups.reduce((count, group) => count + group.items.length, 0);

  function itemRow(item: CartItem, saved = false) {
    const available = Number(item.product.inventory?.quantityOnHand ?? 0) - Number(item.product.inventory?.quantityReserved ?? 0);
    const error = mutation.error instanceof ApiClientError ? mutation.error : null;
    return <div key={item.id} className="rounded-[1.5rem] border border-border bg-slate-50 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold text-slate-900">{item.product.name}</p><p className="mt-1 text-sm text-slate-600">Minimum {item.product.minOrderQuantity} {item.product.unit} · {available} available</p><p className="mt-2 text-sm font-semibold text-primary">{money(item.product.unitPrice, item.product.currency)}/{item.product.unit}</p></div>
      <div className="flex flex-wrap items-center gap-3">{!saved ? <div className="flex items-center rounded-2xl border border-border bg-white px-2 py-2"><Button variant="ghost" size="icon" aria-label={`Decrease ${item.product.name} quantity`} disabled={mutation.isPending || Number(item.quantity) <= Number(item.product.minOrderQuantity)} onClick={() => mutation.mutate({ type: 'update', item, quantity: Number(item.quantity) - 1 })}><Minus className="h-4 w-4" /></Button><span className="min-w-8 text-center text-sm font-semibold text-slate-900">{item.quantity}</span><Button variant="ghost" size="icon" aria-label={`Increase ${item.product.name} quantity`} disabled={mutation.isPending || Number(item.quantity) >= available} onClick={() => mutation.mutate({ type: 'update', item, quantity: Number(item.quantity) + 1 })}><Plus className="h-4 w-4" /></Button></div> : null}
      <Button variant="outline" size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate({ type: saved ? 'restore' : 'save', item })}>{saved ? 'Move to cart' : 'Save for later'}</Button><Button variant="ghost" size="icon" disabled={mutation.isPending} aria-label={`Remove ${item.product.name}`} onClick={() => mutation.mutate({ type: 'remove', item })}><Trash2 className="h-4 w-4" /></Button></div></div>
      {available <= 0 ? <p role="alert" className="mt-3 text-sm text-danger">This item is out of stock.</p> : null}{error ? <p role="alert" className="mt-3 text-sm text-danger">{error.message}</p> : null}
    </div>;
  }

  return <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><div className="space-y-6">
    {activeCount ? data.groups.map(group => <Card key={group.farmer.id} className="border-border/80 bg-white"><CardHeader><CardTitle>{group.farmer.farmName}</CardTitle></CardHeader><CardContent className="space-y-4">{group.items.map(item => itemRow(item))}<div className="rounded-2xl border border-border bg-slate-50 p-3 text-sm text-slate-600"><div className="flex items-center gap-2 font-semibold text-slate-900"><Truck className="h-4 w-4 text-primary" /> Available delivery methods</div><p className="mt-2">Farmer Delivery · Buyer Pickup · Platform Transporter</p><p className="mt-1 text-xs">Choose one method for this farmer group during checkout.</p></div></CardContent></Card>) : <EmptyState title="Your cart is empty" description="Add marketplace products to begin an order." action={<Button asChild><Link href="/marketplace">Browse marketplace</Link></Button>} />}
    {data.savedForLater.length ? <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Saved for later</CardTitle></CardHeader><CardContent className="space-y-4">{data.savedForLater.map(item => itemRow(item, true))}</CardContent></Card> : null}
  </div><aside className="space-y-6"><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Order summary</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600"><div className="flex items-center justify-between"><span>Subtotal</span><span>{money(data.subtotal, data.currency)}</span></div><p className="text-xs">Delivery fees and discounts are calculated securely at checkout.</p><Button asChild className="w-full" aria-disabled={!activeCount}><Link href={activeCount ? '/checkout' : '/marketplace'}>{activeCount ? 'Checkout' : 'Browse marketplace'}</Link></Button>{activeCount ? <Button variant="ghost" className="w-full" disabled={mutation.isPending} onClick={() => mutation.mutate({ type: 'clear' })}>Clear cart</Button> : null}</CardContent></Card></aside></div>;
}

export default function CartPage() { return <ProtectedRoute role="BUYER"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Cart</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Your shopping cart</h1></div><Button asChild variant="outline"><Link href="/marketplace">Continue shopping</Link></Button></div><CartContent /></main></ProtectedRoute>; }
