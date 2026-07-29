import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
}

export function CategoryCard({ id, name, description, image }: CategoryCardProps) {
  return (
    <Card className="border-border/80 bg-white transition hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="text-4xl">{image}</div>
        <p className="mt-4 text-lg font-semibold text-slate-900">{name}</p>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <Link href={`/marketplace/search?categoryId=${encodeURIComponent(id)}`} className="mt-4 inline-flex text-sm font-semibold text-primary">Explore category</Link>
      </CardContent>
    </Card>
  );
}
