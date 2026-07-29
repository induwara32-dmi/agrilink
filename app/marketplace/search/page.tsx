import { Suspense } from 'react';
import { CatalogGrid } from '@/components/features/marketplace/catalog-grid';
import { MarketplaceShell } from '@/components/features/marketplace/marketplace-shell';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function SearchPage() {
  return <MarketplaceShell title="Search results" description="Find products, farmers, and categories across the marketplace."><Suspense fallback={<LoadingSkeleton />}><CatalogGrid /></Suspense></MarketplaceShell>;
}
