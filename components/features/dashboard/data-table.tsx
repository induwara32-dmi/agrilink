import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataTableProps {
  title: string;
  columns: string[];
  rows: Array<Record<string, string | number>>;
}

export function DataTable({ title, columns, rows }: DataTableProps) {
  return (
    <Card className="border-border/80 bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-4 py-3 text-left font-semibold text-slate-600">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-border/60">
                  {columns.map((column) => (
                    <td key={column} className="px-4 py-3 text-slate-700">{row[column] ?? '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
