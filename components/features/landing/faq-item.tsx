'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FAQItemProps {
  question: string;
  answer: string;
}

export function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <Button variant="ghost" className="flex w-full items-center justify-between px-0 py-0 text-left" onClick={() => setOpen((value) => !value)}>
        <span className="text-base font-semibold text-slate-900">{question}</span>
        <ChevronDown className={`h-5 w-5 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
      </Button>
      {open ? <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p> : null}
    </div>
  );
}
