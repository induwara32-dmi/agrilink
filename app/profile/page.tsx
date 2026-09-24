'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { ProfileContent } from '@/components/features/profile/profile-content';
import { Button } from '@/components/ui/button';
import { dashboardPathForRole } from '@/config/access-control';
import { useAuth } from '@/providers/auth-provider';

function BackToDashboard() {
  const { user } = useAuth();
  const href = user ? dashboardPathForRole(user.role) : '/';
  return <Button asChild variant="outline"><Link href={href}><ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard</Link></Button>;
}

export default function ProfilePage() {
  return (
    <ProtectedRoute roles={['BUYER', 'FARMER', 'TRANSPORTER', 'ADMIN']}>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Account</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Your profile</h1>
          </div>
          <BackToDashboard />
        </div>
        <ProfileContent />
      </main>
    </ProtectedRoute>
  );
}
