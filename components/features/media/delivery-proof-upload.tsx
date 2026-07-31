'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadDeliveryProof } from '@/lib/api/media';

export function DeliveryProofUpload({ deliveryId, proofUrl, onUploaded }: { deliveryId: string; proofUrl: string | null; onUploaded: () => void }) {
  const picker = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function submit() { if (!file || receiverName.trim().length < 2) { setError('Choose an image and enter the receiver name.'); return; } setError(null); try { await uploadDeliveryProof(deliveryId, file, { receiverName: receiverName.trim(), ...(notes.trim() ? { notes: notes.trim() } : {}) }, setProgress); setFile(null); setPreview(null); onUploaded(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Upload failed.'); } finally { setProgress(null); } }
  function choose(selected: File | undefined) { if (!selected) return; setFile(selected); setPreview(URL.createObjectURL(selected)); }
  return <div className="space-y-3">{preview || proofUrl ? <Image src={preview ?? proofUrl!} alt="Proof of delivery" width={480} height={220} unoptimized className="h-44 w-full rounded-2xl object-cover" /> : null}<input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choose proof-of-delivery image" onChange={event => choose(event.target.files?.[0])} /><Button type="button" variant="outline" onClick={() => picker.current?.click()}>{proofUrl ? 'Replace proof photo' : 'Choose proof photo'}</Button><Input aria-label="Receiver name" placeholder="Receiver name" value={receiverName} onChange={event => setReceiverName(event.target.value)} /><Input aria-label="Delivery notes" placeholder="Delivery notes (optional)" value={notes} onChange={event => setNotes(event.target.value)} /><Button type="button" disabled={!file || progress !== null} onClick={() => void submit()}>{progress === null ? 'Upload proof' : `Uploading ${progress}%`}</Button>{error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}</div>;
}
