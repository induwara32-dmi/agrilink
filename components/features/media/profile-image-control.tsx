'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { deleteProfileImage, uploadProfileImage } from '@/lib/api/media';
import { useAuth } from '@/providers/auth-provider';

export function ProfileImageControl() {
  const { user, refreshUser } = useAuth();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function choose(file: File | undefined) { if (!file) return; setError(null); setPreview(URL.createObjectURL(file)); try { await uploadProfileImage(file, setProgress); await refreshUser(); setPreview(null); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Upload failed.'); } finally { setProgress(null); } }
  async function remove() { if (!window.confirm('Delete your profile photo?')) return; setError(null); try { setProgress(0); await deleteProfileImage(); await refreshUser(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Delete failed.'); } finally { setProgress(null); } }
  const source = preview ?? user?.profile?.avatarUrl;
  return <div className="mt-3 space-y-2"><div className="flex items-center gap-3">{source ? <Image src={source} alt="Profile photo preview" width={44} height={44} unoptimized className="h-11 w-11 rounded-full object-cover" /> : <div className="h-11 w-11 rounded-full bg-primary/10" aria-label="No profile photo" />}<div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={progress !== null} onClick={() => input.current?.click()}>{source ? 'Replace photo' : 'Add photo'}</Button>{user?.profile?.avatarUrl ? <Button type="button" size="sm" variant="ghost" disabled={progress !== null} onClick={() => void remove()}>Delete</Button> : null}</div></div><input ref={input} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose profile image" onChange={event => void choose(event.target.files?.[0])} />{progress !== null ? <p className="text-xs text-slate-500" role="status">Uploading {progress}%</p> : null}{error ? <p className="text-xs text-danger" role="alert">{error}</p> : null}</div>;
}
