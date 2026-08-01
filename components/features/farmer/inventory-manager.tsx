'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Boxes, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Select } from '@/components/ui/select';
import { adjustInventory, catalogQueryKeys, getManagedProducts, updateInventoryThreshold } from '@/lib/api/catalog';

export function InventoryManager() {
  const queryClient = useQueryClient();
  const products = useQuery({ queryKey: catalogQueryKeys.managedProducts({ page: 1, pageSize: 100, sort: 'nameAsc' }), queryFn: () => getManagedProducts({ page: 1, pageSize: 100, sort: 'nameAsc' }) });
  const [message, setMessage] = useState<Record<string, { text: string; error: boolean }>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function adjust(event: FormEvent<HTMLFormElement>, productId: string) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(productId);
    try {
      await adjustInventory(productId, { type: String(form.get('type')) as 'STOCK_IN' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGE' | 'EXPIRY', quantity: String(form.get('quantity')), reason: String(form.get('reason') ?? '').trim() || undefined });
      setMessage(current => ({ ...current, [productId]: { text: 'Inventory updated successfully.', error: false } }));
      formElement.reset();
      await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
    } catch (cause) { setMessage(current => ({ ...current, [productId]: { text: cause instanceof Error ? cause.message : 'Inventory update failed.', error: true } })); }
    finally { setBusy(null); }
  }

  async function threshold(event: FormEvent<HTMLFormElement>, productId: string) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get('reorderLevel') ?? '');
    setBusy(productId);
    try { await updateInventoryThreshold(productId, value || null); setMessage(current => ({ ...current, [productId]: { text: 'Low-stock threshold saved.', error: false } })); await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all }); }
    catch (cause) { setMessage(current => ({ ...current, [productId]: { text: cause instanceof Error ? cause.message : 'Threshold update failed.', error: true } })); }
    finally { setBusy(null); }
  }

  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Farmer workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Inventory</h1><p className="mt-2 text-sm text-slate-600">Adjust stock and configure low-stock alerts for each product.</p></div>
    {products.isLoading ? <LoadingSkeleton /> : products.isError ? <ErrorState title="Inventory unavailable" description="Product inventory could not be loaded." onRetry={() => void products.refetch()} /> : !products.data?.data.length ? <EmptyState title="No inventory yet" description="Create a product to start managing inventory." action={<Button asChild><Link href="/farmer/products/new">Add Product</Link></Button>} /> : <div className="grid gap-5 xl:grid-cols-2">{products.data.data.map(product => {
      const inventory = product.inventory;
      const available = inventory ? Number(inventory.quantityOnHand) - Number(inventory.quantityReserved) : 0;
      const low = inventory?.reorderLevel !== null && inventory?.reorderLevel !== undefined && available <= Number(inventory.reorderLevel);
      return <Card key={product.id}><CardHeader><div className="flex flex-wrap items-start justify-between gap-2"><div><CardTitle>{product.name}</CardTitle><p className="mt-1 text-sm text-slate-500">Stock measured in {product.unit}</p></div>{low ? <Badge variant="warning">Low stock</Badge> : <Badge variant="success">Stock healthy</Badge>}</div></CardHeader><CardContent className="space-y-5"><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-4 text-center text-sm"><div><p className="text-slate-500">On hand</p><p className="mt-1 font-semibold">{inventory?.quantityOnHand ?? '0'}</p></div><div><p className="text-slate-500">Reserved</p><p className="mt-1 font-semibold">{inventory?.quantityReserved ?? '0'}</p></div><div><p className="text-slate-500">Available</p><p className="mt-1 font-semibold">{available}</p></div></div>
        <form className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={event => void adjust(event, product.id)}><Select name="type" aria-label={`Adjustment type for ${product.name}`}><option value="STOCK_IN">Stock in</option><option value="RETURN">Return</option><option value="ADJUSTMENT">Correction (+/-)</option><option value="DAMAGE">Damage</option><option value="EXPIRY">Expiry</option></Select><Input name="quantity" required inputMode="decimal" pattern="-?\d+(\.\d{1,3})?" placeholder="Quantity" aria-label={`Quantity for ${product.name}`} /><Button type="submit" disabled={busy === product.id}><Boxes className="h-4 w-4" />Adjust</Button><Input name="reason" maxLength={255} placeholder="Reason (optional)" aria-label={`Adjustment reason for ${product.name}`} className="sm:col-span-3" /></form>
        <form className="flex gap-2" onSubmit={event => void threshold(event, product.id)}><Input name="reorderLevel" inputMode="decimal" pattern="\d+(\.\d{1,4})?" defaultValue={inventory?.reorderLevel ?? ''} placeholder="Low-stock threshold" aria-label={`Low-stock threshold for ${product.name}`} /><Button variant="outline" type="submit" disabled={busy === product.id}>Save threshold</Button></form>
        {message[product.id] ? <p role={message[product.id]!.error ? 'alert' : 'status'} className={`text-sm ${message[product.id]!.error ? 'text-danger' : 'text-success'}`}>{message[product.id]!.text}</p> : null}
        <Button variant="ghost" size="sm" asChild><Link href={`/farmer/products/${product.id}/edit`}><Edit3 className="h-4 w-4" />Edit listing</Link></Button>
      </CardContent></Card>;
    })}</div>}
  </div>;
}
