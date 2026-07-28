import { MarketplaceShell } from '@/components/features/marketplace/marketplace-shell';
import { ProductCard } from '@/components/features/marketplace/product-card';
import { products } from '@/components/features/marketplace/marketplace-data';

export default function SearchPage() {
  return (
    <MarketplaceShell title="Search results" description="Find products, farmers, and categories across the marketplace.">
      <div className="grid gap-4 md:grid-cols-2">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} title={product.title} price={product.price} farmer={product.farmer} location={product.location} rating={product.rating} badge={product.badge} />
        ))}
      </div>
    </MarketplaceShell>
  );
}
