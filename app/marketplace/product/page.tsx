import { Suspense } from 'react';
import { MarketplaceShell } from '@/components/features/marketplace/marketplace-shell';
import { ProductDetails } from '@/components/features/marketplace/product-details';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function ProductDetailsPage() {
  return <MarketplaceShell title="Product details" description="Review product details, delivery options, and farmer information before buying."><Suspense fallback={<LoadingSkeleton />}><ProductDetails /></Suspense></MarketplaceShell>;
}
