'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ToastMessage } from '@/components/ui/toast-message';
import { archiveNotification, deleteNotification, listNotifications, markAllNotificationsRead, markNotificationRead, notificationQueryKeys, type NotificationRecord } from '@/lib/api/notifications';

export function NotificationPanel({ compact = false }: { compact?: boolean }) {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const notifications = useQuery({ queryKey: notificationQueryKeys.list(page), queryFn: () => listNotifications(page), refetchInterval: 60_000 });
  const refresh = async () => { await client.invalidateQueries({ queryKey: notificationQueryKeys.all }); };
  const single = useMutation({ mutationFn: async ({ item, action }: { item: NotificationRecord; action: 'read' | 'archive' | 'delete' }) => { if (action === 'read') await markNotificationRead(item.id); else if (action === 'archive') await archiveNotification(item.id); else await deleteNotification(item.id); }, onSuccess: async (_response, variables) => { await refresh(); setToast(variables.action === 'read' ? 'Notification marked as read.' : variables.action === 'archive' ? 'Notification archived.' : 'Notification deleted.'); } });
  const allRead = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: async response => { await refresh(); setToast(`${response.data.updated} notification${response.data.updated === 1 ? '' : 's'} marked as read.`); } });
  if (notifications.isLoading) return <LoadingSkeleton />;
  if (notifications.isError) return <ErrorState title="Notifications unavailable" description="We could not load your notifications." onRetry={() => void notifications.refetch()} />;
  const items = notifications.data?.data ?? [];
  const visible = compact ? items.slice(0, 4) : items;
  return <div className="space-y-4"><div className="flex items-center justify-between gap-3"><p className="text-sm text-slate-600">Recent updates</p><Button size="sm" variant="outline" disabled={allRead.isPending || !items.some(item => item.status === 'UNREAD')} onClick={() => allRead.mutate()}>Mark all read</Button></div>{visible.length ? <div className="space-y-3">{visible.map(item => <article key={item.id} className={`rounded-2xl border p-3 text-sm ${item.status === 'UNREAD' ? 'border-primary/20 bg-primary/5' : 'border-border bg-slate-50'}`}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.title}</p><p className="mt-1 text-slate-600">{item.body}</p><p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p></div>{item.status === 'UNREAD' ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}</div><div className="mt-3 flex flex-wrap gap-2">{item.status === 'UNREAD' ? <Button size="sm" variant="ghost" disabled={single.isPending} onClick={() => single.mutate({ item, action: 'read' })}><Check className="mr-1 h-3 w-3" /> Read</Button> : null}{item.status !== 'ARCHIVED' ? <Button size="sm" variant="ghost" disabled={single.isPending} onClick={() => single.mutate({ item, action: 'archive' })}><Archive className="mr-1 h-3 w-3" /> Archive</Button> : null}<Button size="sm" variant="ghost" disabled={single.isPending} onClick={() => single.mutate({ item, action: 'delete' })}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button></div></article>)}</div> : <EmptyState title="No notifications" description="Account and order updates will appear here." />}{compact ? <Button asChild variant="outline" className="w-full"><Link href="/notifications">View all notifications</Link></Button> : notifications.data?.meta && notifications.data.meta.totalPages > 1 ? <div className="flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(current => current - 1)}>Previous</Button><span className="text-sm">Page {page} of {notifications.data.meta.totalPages}</span><Button variant="outline" size="sm" disabled={page >= notifications.data.meta.totalPages} onClick={() => setPage(current => current + 1)}>Next</Button></div> : null}{toast ? <ToastMessage message={toast} /> : null}</div>;
}
