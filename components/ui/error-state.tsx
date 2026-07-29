import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, actionHref = '/dashboard', actionLabel = 'Return home', onRetry }: ErrorStateProps) {
  return (
    <Card className="border-border/80 bg-white">
      <CardContent className="p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">{description}</p>
        <div className="mt-6 flex justify-center">
          {onRetry ? <Button onClick={onRetry}>Try again</Button> : (
            <Button asChild>
              <Link href={actionHref}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {actionLabel}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
