import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
}

export function PricingCard({ name, price, description, features, featured = false }: PricingCardProps) {
  return (
    <Card className={featured ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-white'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          {featured ? <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">Popular</span> : null}
        </div>
        <p className="text-sm text-slate-600">{description}</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-semibold tracking-tight text-slate-900">{price}</span>
          <span className="text-sm text-slate-500">/ month</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3 text-sm text-slate-600">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" /> {feature}
            </li>
          ))}
        </ul>
        <Button className="w-full" variant={featured ? 'default' : 'outline'}>
          Choose plan
        </Button>
      </CardContent>
    </Card>
  );
}
