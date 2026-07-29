import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { NotificationPanel } from '@/components/features/notifications/notification-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotificationsPage() { return <ProtectedRoute><main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Notifications</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Your updates</h1></div><Button asChild variant="outline"><Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard</Link></Button></div><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Notification center</CardTitle></CardHeader><CardContent><NotificationPanel /></CardContent></Card></main></ProtectedRoute>; }
