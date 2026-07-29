import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading page">
      <LoadingSkeleton />
    </main>
  );
}
