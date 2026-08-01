'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductForm } from '@/components/features/farmer/product-form';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { catalogQueryKeys, getManagedProduct } from '@/lib/api/catalog';

export function EditProduct({ productId }: { productId: string }) {
  const product = useQuery({ queryKey: catalogQueryKeys.product(productId), queryFn: () => getManagedProduct(productId) });
  if (product.isLoading) return <LoadingSkeleton />;
  if (product.isError) return <ErrorState title="Product unavailable" description="This product could not be loaded or you do not have permission to edit it." actionHref="/farmer/products" actionLabel="Return to products" />;
  return product.data ? <ProductForm product={product.data.data} /> : null;
}
