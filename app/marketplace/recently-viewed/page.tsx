import { MarketplaceShell } from '@/components/features/marketplace/marketplace-shell';
import { ProductCard } from '@/components/features/marketplace/product-card';
import { featuredProducts } from '@/components/features/marketplace/marketplace-data';

export default function RecentlyViewedPage() {
  return (
    <MarketplaceShell title="Recently viewed" description="Revisit products you explored recently and compare offers.">
      <div className="grid gap-4 md:grid-cols-2">
        {featuredProducts.slice(1, 3).map((product) => (
          <ProductCard key={product.id} title={product.title} price={product.price} farmer={product.farmer} location={product.location} rating={product.rating} badge={product.badge} />
        ))}
      </div>
    </MarketplaceShell>
  );
}
