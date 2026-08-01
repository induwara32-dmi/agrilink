'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShoppingBag, Sprout, Truck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { AuthFormField } from '@/components/features/auth/auth-form-field';
import { RoleOption } from '@/components/features/auth/role-option';
import { Button } from '@/components/ui/button';
import { PUBLIC_USER_ROLES, type PublicUserRole } from '@/config/domain';
import { register, type PublicRegistrationRole } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/client';
import { useSignup } from '@/providers/signup-provider';

const roleDetails: Record<PublicUserRole, { description: string; icon: React.ReactNode; apiRole: PublicRegistrationRole }> = {
  Buyer: { description: 'Browse listings, request orders, and manage purchasing workflows.', icon: <ShoppingBag className="h-5 w-5" />, apiRole: 'BUYER' },
  Farmer: { description: 'List produce, manage availability, and build reliable buyer relationships.', icon: <Sprout className="h-5 w-5" />, apiRole: 'FARMER' },
  Transporter: { description: 'Accept delivery jobs, coordinate routes, and update shipment progress.', icon: <Truck className="h-5 w-5" />, apiRole: 'TRANSPORTER' },
};

const roles = PUBLIC_USER_ROLES.map((title) => ({ title, ...roleDetails[title] }));

function errorMessage(error: unknown): string {
  if (!(error instanceof ApiClientError)) return 'Unable to create your account. Please try again.';
  if (!error.details || typeof error.details !== 'object') return error.message;
  const fieldErrors = 'fieldErrors' in error.details ? error.details.fieldErrors : null;
  if (!fieldErrors || typeof fieldErrors !== 'object') return error.message;
  const messages = Object.values(fieldErrors).flatMap((value) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);
  return messages.length ? `${error.message} ${[...new Set(messages)].join(' ')}` : error.message;
}

export default function RoleSelectionPage() {
  const router = useRouter();
  const { draft, clearDraft } = useSignup();
  const [selectedRole, setSelectedRole] = useState<PublicUserRole>('Buyer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) {
      setError('Enter your account details before choosing a role.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const farmName = String(form.get('farmName') ?? '').trim();
    const businessName = String(form.get('businessName') ?? '').trim();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        ...draft,
        role: roleDetails[selectedRole].apiRole,
        ...(farmName ? { farmName } : {}),
        ...(businessName ? { businessName } : {}),
      });
      clearDraft();
      router.replace('/auth/email-verification-success?registered=1');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Choose your role"
      description="Select the role that best represents how you will participate in AgriLink."
      footer={<p>Need to update your details?{' '}<Link href="/auth/sign-up" className="font-semibold text-primary">Go back</Link></p>}
    >
      <form className="space-y-3" onSubmit={handleSubmit}>
        {roles.map((role) => (
          <RoleOption key={role.title} title={role.title} description={role.description} icon={role.icon} selected={selectedRole === role.title} onSelect={() => setSelectedRole(role.title)} />
        ))}
        {selectedRole === 'Farmer' ? <AuthFormField label="Farm name" name="farmName" required minLength={2} maxLength={180} placeholder="Green Valley Farm" /> : null}
        {selectedRole === 'Transporter' ? <AuthFormField label="Business name (optional)" name="businessName" minLength={2} maxLength={180} placeholder="Reliable Farm Logistics" /> : null}
        {error ? <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
        {!draft ? <p className="text-sm text-slate-600">Your account details are not available. Return to the previous step to continue securely.</p> : null}
        <Button size="lg" className="w-full" type="submit" disabled={isSubmitting || !draft}>
          {isSubmitting ? 'Creating account…' : 'Create account'} {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </form>
    </AuthShell>
  );
}
