'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProductImage } from '@/lib/api/types';
import { deleteProductImage, reorderProductImages, setPrimaryProductImage, uploadProductImages } from '@/lib/api/media';
import { catalogQueryKeys } from '@/lib/api/catalog';

export function ProductImageManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const picker = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ['product', productId] }), queryClient.invalidateQueries({ queryKey: catalogQueryKeys.product(productId) }), queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all })]); };
  async function upload(files: FileList | null) { if (!files?.length) return; setError(null); try { await uploadProductImages(productId, [...files], '', setProgress); await refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Upload failed.'); } finally { setProgress(null); if (picker.current) picker.current.value = ''; } }
  async function mutate(action: () => Promise<unknown>) { setError(null); try { await action(); await refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Image update failed.'); } }
  async function move(index: number, offset: number) { const next = [...images]; const target = index + offset; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target]!, next[index]!]; await mutate(() => reorderProductImages(productId, next.map(image => image.id))); }
  return <div className="space-y-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">Product images</p><Button type="button" size="sm" variant="outline" disabled={progress !== null || images.length >= 8} onClick={() => picker.current?.click()}><Upload className="h-4 w-4" /> Add images</Button></div><input ref={picker} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choose product images" onChange={event => void upload(event.target.files)} />{images.length ? <div className="grid gap-3 sm:grid-cols-2">{images.map((image, index) => <div key={image.id} className="rounded-2xl border border-border p-2"><Image src={image.url} alt={image.altText ?? 'Product image'} width={240} height={128} unoptimized className="h-28 w-full rounded-xl object-cover" /><div className="mt-2 flex flex-wrap gap-1"><Button size="icon" variant="ghost" aria-label="Move image left" disabled={index === 0} onClick={() => void move(index, -1)}><ArrowLeft className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label="Move image right" disabled={index === images.length - 1} onClick={() => void move(index, 1)}><ArrowRight className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label="Set primary image" disabled={image.isPrimary} onClick={() => void mutate(() => setPrimaryProductImage(productId, image.id))}><Star className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label="Delete product image" onClick={() => { if (window.confirm('Delete this product image?')) void mutate(() => deleteProductImage(productId, image.id)); }}><Trash2 className="h-4 w-4" /></Button></div></div>)}</div> : <p className="text-sm text-slate-500">No images uploaded.</p>}{progress !== null ? <p className="text-sm text-slate-500" role="status">Uploading {progress}%</p> : null}{error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}</div>;
}
