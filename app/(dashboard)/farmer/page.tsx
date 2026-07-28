import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FarmerDashboardPage() {
  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-white">
        <CardHeader>
          <CardTitle>Farmer workspace</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Farmer-specific dashboard views will be added here as the product expands.
        </CardContent>
      </Card>
    </div>
  );
}
