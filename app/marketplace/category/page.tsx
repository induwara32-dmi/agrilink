import { CategoryGrid } from '@/components/features/marketplace/category-grid';
import { MarketplaceShell } from '@/components/features/marketplace/marketplace-shell';

export default function CategoryPage() {
  return <MarketplaceShell title="Browse categories" description="Explore curated categories for fresh produce, grains, and livestock trade."><CategoryGrid /></MarketplaceShell>;
}
