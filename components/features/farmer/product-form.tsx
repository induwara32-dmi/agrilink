'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ProductImageManager } from '@/components/features/media/product-image-manager';
import { adjustInventory, catalogQueryKeys, createProduct, getCategories, updateProduct, type ProductInput } from '@/lib/api/catalog';
import { uploadProductImages } from '@/lib/api/media';
import type { Product } from '@/lib/api/types';

const fieldClass = 'space-y-1.5';
const labelClass = 'text-sm font-medium text-slate-700';
const PRODUCT_UNITS = ['kg', 'g', 'crate', 'bunch', 'piece', 'bag'] as const;

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: catalogQueryKeys.categories(), queryFn: getCategories });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [unit, setUnit] = useState(() => PRODUCT_UNITS.includes(product?.unit as (typeof PRODUCT_UNITS)[number]) ? product!.unit : 'kg');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const input: ProductInput = {
      name: String(form.get('name') ?? '').trim(),
      categoryId,
      description: String(form.get('description') ?? '').trim(),
      unit,
      unitPrice: String(form.get('unitPrice') ?? ''),
      currency: product?.currency ?? 'LKR',
      minOrderQuantity: String(form.get('minOrderQuantity') ?? ''),
      status: product?.status ?? 'ACTIVE',
      ...(!product ? {
        initialQuantity: String(form.get('initialQuantity') ?? ''),
        reorderLevel: '5',
      } : {}),
    };

    try {
      if (product) {
        const { initialQuantity: _initial, reorderLevel: _threshold, ...update } = input;
        void _initial; void _threshold;
        await updateProduct(product.id, update);
        const requestedAvailable = Number(form.get('initialQuantity'));
        const currentAvailable = Number(product.inventory?.quantityOnHand ?? 0) - Number(product.inventory?.quantityReserved ?? 0);
        const difference = requestedAvailable - currentAvailable;
        if (difference !== 0) await adjustInventory(product.id, { type: 'ADJUSTMENT', quantity: String(difference), reason: 'Updated from product form' });
      } else {
        const created = await createProduct(input);
        const files = form.getAll('images').filter((value): value is File => value instanceof File && value.size > 0);
        if (files.length) await uploadProductImages(created.data.id, files, created.data.name, setUploadProgress);
      }
      await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      router.push(`/farmer/products?success=${product ? 'updated' : 'created'}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save the product.');
    } finally {
      setUploadProgress(null);
      setIsSubmitting(false);
    }
  }

  if (categories.isLoading) return <LoadingSkeleton />;
  if (categories.isError) return <ErrorState title="Categories unavailable" description="Categories are required before a product can be saved." onRetry={() => void categories.refetch()} />;

  return <form className="space-y-6" onSubmit={handleSubmit}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Farmer products</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{product ? 'Edit product' : 'Add product'}</h1></div>
      <Button variant="outline" asChild><Link href="/farmer/products"><ArrowLeft className="h-4 w-4" />Products</Link></Button>
    </div>
    <Card><CardHeader><CardTitle>Listing details</CardTitle></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">
      <label className={fieldClass}><span className={labelClass}>Product name</span><Input name="name" required minLength={2} maxLength={180} defaultValue={product?.name} /></label>
      <label className={fieldClass}><span className={labelClass}>Category</span><Select name="categoryId" required value={categoryId} onChange={event => setCategoryId(event.target.value)}><option value="" disabled>Select category</option>{categories.data?.data.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></label>
      <label className={`${fieldClass} md:col-span-2`}><span className={labelClass}>Description</span><textarea name="description" required minLength={10} maxLength={10000} defaultValue={product?.description} rows={5} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
      <label className={fieldClass}><span className={labelClass}>Unit</span><Select name="unit" required value={unit} onChange={event => setUnit(event.target.value)}>{PRODUCT_UNITS.map(option => <option key={option} value={option}>{option}</option>)}</Select></label>
      <label className={fieldClass}><span className={labelClass}>Price per {unit}</span><Input name="unitPrice" required inputMode="decimal" pattern="\d+(\.\d{1,4})?" defaultValue={product?.unitPrice} /></label>
      <label className={fieldClass}><span className={labelClass}>Available stock</span><Input name="initialQuantity" required inputMode="decimal" pattern="\d+(\.\d{1,3})?" defaultValue={product ? String(Number(product.inventory?.quantityOnHand ?? 0) - Number(product.inventory?.quantityReserved ?? 0)) : '0'} /></label>
      <label className={fieldClass}><span className={labelClass}>Minimum order quantity</span><Input name="minOrderQuantity" required inputMode="decimal" pattern="\d+(\.\d{1,4})?" defaultValue={product?.minOrderQuantity ?? '1'} /></label>
      {!product ? <label className={`${fieldClass} md:col-span-2`}><span className={labelClass}>Product images</span><Input name="images" type="file" multiple accept="image/jpeg,image/png,image/webp" /><span className="text-xs text-slate-500">Up to 8 JPEG, PNG, or WebP images. Images upload after the listing is created.</span></label> : null}
    </CardContent></Card>
    {product ? <Card><CardContent className="pt-6"><ProductImageManager productId={product.id} images={product.images} /></CardContent></Card> : null}
    {uploadProgress !== null ? <p role="status" className="text-sm text-slate-600"><Upload className="mr-2 inline h-4 w-4" />Uploading images: {uploadProgress}%</p> : null}
    {error ? <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
    <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : <><Save className="h-4 w-4" />Save product</>}</Button>
  </form>;
}
