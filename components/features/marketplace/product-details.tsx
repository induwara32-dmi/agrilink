'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { getProduct } from '@/lib/api/catalog';
import { addCartItem, cartQueryKeys } from '@/lib/api/commerce';
import { ApiClientError } from '@/lib/api/client';
import { useAuth } from '@/providers/auth-provider';
import { ProductImageManager } from '@/components/features/media/product-image-manager';

export function ProductDetails() {
  const id = useSearchParams().get('id');
  const { user } = useAuth();
  const product = useQuery({ queryKey: ['product', id], queryFn: () => getProduct(id!), enabled: Boolean(id) });
  const addItem = useQueryClientMutation();
  if (!id) return <EmptyState title="Select a product" description="Open a product from the marketplace to view its details." />;
  if (product.isLoading) return <LoadingSkeleton />;
  if (product.isError) return <ErrorState title="Product unavailable" description="This product could not be loaded or is no longer available." actionHref="/marketplace/search" actionLabel="Browse products" />;
  const item = product.data?.data;
  if (!item) return null;
  const price = new Intl.NumberFormat(undefined, { style: 'currency', currency: item.currency }).format(Number(item.unitPrice));

  return <div className="space-y-6">
    <Card className="border-border/80 bg-white"><CardContent className="p-6"><div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-slate-50 p-8 text-center text-6xl">{item.images[0] ? <Image src={item.images[0].url} alt={item.images[0].altText ?? item.name} width={640} height={256} unoptimized className="h-64 w-full object-cover" /> : '🌿'}</div>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{item.category.name}</p><h2 className="mt-2 text-2xl font-semibold text-slate-900">{item.name}</h2></div><Button variant="ghost" size="icon" aria-label={`Add ${item.name} to wishlist`}><Heart className="h-4 w-4" /></Button></div>
        <p className="text-sm leading-7 text-slate-600">{item.description}</p>
        <p className="text-xl font-semibold text-slate-900">{price}/{item.unit}</p>
        <div className="flex items-center gap-2 text-sm text-slate-600"><Star className="h-4 w-4 text-primary" /> New marketplace listing</div>
        {addItem.error ? <p role="alert" className="text-sm text-danger">{addItem.error instanceof ApiClientError ? addItem.error.message : 'Unable to add this product.'}</p> : null}
        <div className="flex flex-wrap gap-3"><Button disabled={addItem.isPending} onClick={() => addItem.mutate({ productId: item.id, quantity: item.minOrderQuantity, checkout: true, role: user?.role })}>Buy now</Button><Button variant="outline" disabled={addItem.isPending} onClick={() => addItem.mutate({ productId: item.id, quantity: item.minOrderQuantity, checkout: false, role: user?.role })}>{addItem.isPending ? 'Adding…' : 'Add to cart'}</Button></div>
      </div>
    </div></CardContent></Card>
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Farmer information</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600"><p className="font-semibold text-slate-900">{item.farmer.farmName}</p><p>{item.farmer.user.profile?.displayName ?? 'Verified AgriLink farmer'}</p><div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /> Contact seller</div></CardContent></Card>
      <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Delivery options</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600"><div className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 p-3"><Truck className="h-4 w-4 text-primary" /> Farmer delivery</div><div className="rounded-2xl border border-border bg-slate-50 p-3">Buyer pickup</div><div className="rounded-2xl border border-border bg-slate-50 p-3">Platform transporter</div></CardContent></Card>
    </div>
    {(user?.role === 'ADMIN' || (user?.role === 'FARMER' && item.farmer.user.id === user.id)) ? <Card className="border-border/80 bg-white"><CardContent className="p-6"><ProductImageManager productId={item.id} images={item.images} /></CardContent></Card> : null}
  </div>;
}

function useQueryClientMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async ({ productId, quantity, role }: { productId: string; quantity: string; checkout: boolean; role?: string }) => { if (!role) { router.push('/auth/sign-in'); throw new Error('Sign in as a buyer to add products.'); } if (role !== 'BUYER') throw new Error('Only buyer accounts can use the cart.'); return addCartItem(productId, quantity); }, onSuccess: async (_response, variables) => { await queryClient.invalidateQueries({ queryKey: cartQueryKeys.all }); router.push(variables.checkout ? '/checkout' : '/cart'); } });
}
