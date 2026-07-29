'use client';

export function ToastMessage({ message, tone = 'success' }: { message: string; tone?: 'success' | 'error' }) { return <div role="status" aria-live="polite" className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border bg-white px-4 py-3 text-sm shadow-lg ${tone === 'error' ? 'border-danger/30 text-danger' : 'border-success/30 text-success'}`}>{message}</div>; }
