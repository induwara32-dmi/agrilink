'use client';

import { ErrorState } from '@/components/ui/error-state';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full">
        <ErrorState title="Something went wrong" description="AgriLink could not load this page. Please try again or return to the dashboard." onRetry={reset} />
      </div>
    </main>
  );
}
