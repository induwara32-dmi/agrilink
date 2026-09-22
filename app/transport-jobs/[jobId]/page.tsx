import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { JobDetails } from '@/components/features/logistics/job-details';
import { Button } from '@/components/ui/button';

export default async function TransportJobDetailsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return <ProtectedRoute role="TRANSPORTER"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Transport job</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Job details</h1></div><Button asChild variant="outline"><Link href="/transporter"><ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard</Link></Button></div><JobDetails jobId={jobId} /></main></ProtectedRoute>;
}
