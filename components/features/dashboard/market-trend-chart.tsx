'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Jan', value: 32 },
  { name: 'Feb', value: 39 },
  { name: 'Mar', value: 36 },
  { name: 'Apr', value: 48 },
  { name: 'May', value: 54 },
  { name: 'Jun', value: 58 },
];

export function MarketTrendChart() {
  return (
    <Card className="border-border/80 bg-white">
      <CardHeader>
        <CardTitle>Market Price Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#2E7D32" fill="#81C784" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
