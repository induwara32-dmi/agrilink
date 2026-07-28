import { MarketplaceShell } from '@/components/features/marketplace/marketplace-shell';
import { CategoryCard } from '@/components/features/marketplace/category-card';
import { categories } from '@/components/features/marketplace/marketplace-data';

export default function CategoryPage() {
  return (
    <MarketplaceShell title="Browse categories" description="Explore curated categories for fresh produce, grains, and livestock trade.">
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <CategoryCard key={category.name} name={category.name} description={category.description} image={category.image} />
        ))}
      </div>
    </MarketplaceShell>
  );
}
