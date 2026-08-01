'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

export function ImpactCounter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const animatedCount = useSpring(count, { stiffness: 70, damping: 22, mass: 0.8 });
  const formatted = useTransform(animatedCount, current => `${Math.round(current).toLocaleString('en-US')}+`);

  useEffect(() => {
    if (isInView) count.set(value);
  }, [count, isInView, value]);

  return <motion.div ref={ref} initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} className="rounded-2xl border border-border bg-slate-50 p-6 text-center">
    <p className="sr-only">{value.toLocaleString('en-US')} plus {label}</p>
    <motion.p aria-hidden="true" className="text-3xl font-semibold tracking-tight text-slate-900">{reduceMotion ? `${value.toLocaleString('en-US')}+` : formatted}</motion.p>
    <p aria-hidden="true" className="mt-2 text-sm font-medium text-slate-600">{label}</p>
  </motion.div>;
}
