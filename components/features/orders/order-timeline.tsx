import { CheckCircle2, Circle } from 'lucide-react';
import { TIMELINE_STATUSES, getTimelineIndex, type TimelineStatus } from '@/components/features/orders/order-data';

export function OrderTimeline({ currentStatus }: { currentStatus: TimelineStatus }) {
  const activeIndex = getTimelineIndex(currentStatus);

  return (
    <div className="space-y-3">
      {TIMELINE_STATUSES.map((step, index) => {
        const isComplete = index < activeIndex;
        const isActive = index === activeIndex;
        const stateClasses = isComplete
          ? 'border-success/30 bg-success/10 text-success'
          : isActive
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-white text-slate-500';

        return (
          <div key={step} className={`flex items-start gap-3 rounded-2xl border p-3 ${stateClasses}`}>
            {isComplete ? <CheckCircle2 className="mt-0.5 h-5 w-5" /> : <Circle className="mt-0.5 h-5 w-5" />}
            <div>
              <p className="font-semibold">{step}</p>
              <p className="text-sm text-slate-600">
                {isComplete ? 'Completed' : isActive ? 'Current step' : 'Upcoming'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
