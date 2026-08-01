'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Edit3, FolderPlus, Search, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Select } from '@/components/ui/select';
import { catalogQueryKeys, createCategory, deleteCategory, getAdminCategories, updateCategory } from '@/lib/api/catalog';
import type { Category } from '@/lib/api/types';

type Feedback = { message: string; error: boolean };

export function CategoryManagement() {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: catalogQueryKeys.adminCategories(), queryFn: getAdminCategories });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => (categories.data?.data ?? []).filter(category => {
    const matchesSearch = !search || category.name.toLowerCase().includes(search.toLowerCase()) || category.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || (status === 'active' ? category.isActive : !category.isActive);
    return matchesSearch && matchesStatus;
  }), [categories.data?.data, search, status]);

  function resetForm() { setEditing(null); setName(''); setDescription(''); setIsActive(true); setSortOrder('0'); }
  function beginEdit(category: Category) { setEditing(category); setName(category.name); setDescription(category.description ?? ''); setIsActive(category.isActive); setSortOrder(String(category.sortOrder)); setFeedback(null); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setFeedback(null);
    const input = { name: name.trim(), description: description.trim() || undefined, isActive, sortOrder: Number(sortOrder) };
    try {
      if (editing) await updateCategory(editing.id, input); else await createCategory(input);
      await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      setFeedback({ message: `Category ${editing ? 'updated' : 'created'} successfully. It is now available to active farmer product forms.`, error: false });
      resetForm();
    } catch (cause) { setFeedback({ message: cause instanceof Error ? cause.message : 'Unable to save the category.', error: true }); }
    finally { setBusy(false); }
  }

  async function archive(category: Category) {
    if (!window.confirm(`Delete “${category.name}”? Existing products retain their category record, but it will no longer be selectable.`)) return;
    setBusy(true); setFeedback(null);
    try { await deleteCategory(category.id); await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all }); setFeedback({ message: 'Category deleted successfully.', error: false }); if (editing?.id === category.id) resetForm(); }
    catch (cause) { setFeedback({ message: cause instanceof Error ? cause.message : 'Unable to delete the category.', error: true }); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Admin workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Categories</h1><p className="mt-2 text-sm text-slate-600">Manage the category options used throughout the marketplace and farmer product forms.</p></div>
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card><CardHeader><CardTitle>{editing ? 'Edit category' : 'Add category'}</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={submit}>
        <label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">Category name</span><Input required minLength={2} maxLength={120} value={name} onChange={event => setName(event.target.value)} /></label>
        <label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">Description</span><textarea maxLength={5000} rows={4} value={description} onChange={event => setDescription(event.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">Status</span><Select value={isActive ? 'active' : 'inactive'} onChange={event => setIsActive(event.target.value === 'active')}><option value="active">Active</option><option value="inactive">Inactive</option></Select></label><label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">Sort order</span><Input type="number" min={0} step={1} value={sortOrder} onChange={event => setSortOrder(event.target.value)} /></label></div>
        {feedback ? <p role={feedback.error ? 'alert' : 'status'} className={`rounded-xl p-3 text-sm ${feedback.error ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{feedback.message}</p> : null}
        <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy}>{editing ? <Edit3 className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}{busy ? 'Saving…' : editing ? 'Save changes' : 'Add category'}</Button>{editing ? <Button type="button" variant="outline" onClick={resetForm}><X className="h-4 w-4" />Cancel</Button> : null}</div>
      </form></CardContent></Card>
      <Card><CardHeader><CardTitle>Category list</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 sm:grid-cols-[1fr_180px]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input aria-label="Search categories" placeholder="Search categories" value={search} onChange={event => setSearch(event.target.value)} className="pl-9" /></div><Select aria-label="Filter categories by status" value={status} onChange={event => setStatus(event.target.value as typeof status)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></Select></div>
        {categories.isLoading ? <LoadingSkeleton /> : categories.isError ? <ErrorState title="Categories unavailable" description="The category list could not be loaded." onRetry={() => void categories.refetch()} /> : !filtered.length ? <EmptyState title="No categories found" description="Add a category or adjust the current filters." /> : <div className="space-y-3">{filtered.map(category => <div key={category.id} className="rounded-2xl border border-border bg-slate-50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-900">{category.name}</p><Badge variant={category.isActive ? 'success' : 'outline'}>{category.isActive ? 'Active' : 'Inactive'}</Badge></div><p className="mt-1 text-sm text-slate-600">{category.description || 'No description provided.'}</p><p className="mt-2 text-xs text-slate-500">Sort order: {category.sortOrder}</p></div><div className="flex gap-2"><Button size="icon" variant="outline" aria-label={`Edit ${category.name}`} onClick={() => beginEdit(category)}><Edit3 className="h-4 w-4" /></Button><Button size="icon" variant="destructive" aria-label={`Delete ${category.name}`} disabled={busy} onClick={() => void archive(category)}><Trash2 className="h-4 w-4" /></Button></div></div></div>)}</div>}
        {!categories.isLoading && !categories.isError ? <p className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 text-success" />{filtered.length} of {categories.data?.data.length ?? 0} categories shown</p> : null}
      </CardContent></Card>
    </div>
  </div>;
}
