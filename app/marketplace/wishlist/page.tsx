import { MarketplaceShell } from '@/components/features/marketplace/marketplace-shell';
import { ProductCard } from '@/components/features/marketplace/product-card';
import { featuredProducts } from '@/components/features/marketplace/marketplace-data';

export default function WishlistPage() {
  return (
    <MarketplaceShell title="Wishlist" description="Keep track of the products and suppliers you want to revisit.">
      <div className="grid gap-4 md:grid-cols-2">
        {featuredProducts.slice(0, 2).map((product) => (
          <ProductCard key={product.id} title={product.title} price={product.price} farmer={product.farmer} location={product.location} rating={product.rating} badge={product.badge} />
        ))}
      </div>
    </MarketplaceShell>
  );
}
