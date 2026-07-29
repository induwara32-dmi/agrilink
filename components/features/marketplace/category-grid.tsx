'use client';

import { useQuery } from '@tanstack/react-query';
import { CategoryCard } from './category-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { getCategories } from '@/lib/api/catalog';

export function CategoryGrid() {
  const categories = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  if (categories.isLoading) return <LoadingSkeleton />;
  if (categories.isError) return <ErrorState title="Categories unavailable" description="We could not load marketplace categories." onRetry={() => void categories.refetch()} />;
  if (!categories.data?.data.length) return <EmptyState title="No categories yet" description="Marketplace categories will appear here when available." />;
  return <div className="grid gap-4 md:grid-cols-2">{categories.data.data.map((category) => <CategoryCard key={category.id} id={category.id} name={category.name} description={category.description ?? 'Explore available agricultural products'} image="🌾" />)}</div>;
}
