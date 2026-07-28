import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-white">
        <CardHeader>
          <CardTitle>Admin workspace</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Admin-specific dashboard views will be added here as the product expands.
        </CardContent>
      </Card>
    </div>
  );
}
