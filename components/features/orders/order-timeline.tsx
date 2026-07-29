import { CheckCircle2 } from 'lucide-react';
import type { DeliveryStatusHistory } from '@/lib/api/commerce';

export function OrderTimeline({ history }: { history: DeliveryStatusHistory[] }) {
  return <div className="space-y-3">{history.map((event, index) => <div key={event.id} className={`flex items-start gap-3 rounded-2xl border p-3 ${index === history.length - 1 ? 'border-primary bg-primary/10 text-primary' : 'border-success/30 bg-success/10 text-success'}`}><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">{event.toStatus.replaceAll('_', ' ').toLowerCase()}</p><p className="text-sm text-slate-600">{event.note ?? 'Delivery status updated'} · {new Date(event.occurredAt).toLocaleString()}</p></div></div>)}</div>;
}
