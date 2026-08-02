import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProductCardProps {
  id: string | number;
  title: string;
  price: string;
  farmer: string;
  location: string;
  rating: string;
  badge: string;
  imageUrl?: string;
}

export function ProductCard({ id, title, price, farmer, location, rating, badge, imageUrl }: ProductCardProps) {
  return (
    <Card className="border-border/80 bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="outline">{badge}</Badge>
          <Button variant="ghost" size="icon" aria-label={`Save ${title}`}><Heart className="h-4 w-4" /></Button>
        </div>
        <div className="mt-4 flex min-h-28 items-center justify-center overflow-hidden rounded-2xl border border-border bg-slate-50 p-6 text-center text-4xl">
          {imageUrl ? <Image src={imageUrl} alt={title} width={320} height={96} unoptimized className="h-24 w-full object-cover" /> : '🌿'}
        </div>
        <div className="mt-4">
          <p className="text-lg font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{farmer}</p>
          <p className="mt-1 text-sm text-slate-500">{location}</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{price}</span>
          <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary" /> {rating}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm"><Link href={`/marketplace/product?id=${encodeURIComponent(id)}`}>View details</Link></Button>
          <Button variant="outline" size="sm">Add to wishlist</Button>
        </div>
      </CardContent>
    </Card>
  );
}
