'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShoppingBag, Sprout, Truck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { AuthFormField } from '@/components/features/auth/auth-form-field';
import { RoleOption } from '@/components/features/auth/role-option';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { PUBLIC_USER_ROLES, type PublicUserRole } from '@/config/domain';
import { register, type PublicRegistrationRole } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/client';
import { VEHICLE_TYPE_OPTIONS, type VehicleTypeCode } from '@/lib/api/logistics';
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
  const [wantsBuyerAddress, setWantsBuyerAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) {
      setError('Enter your account details before choosing a role.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? '').trim();
    const farmName = field('farmName');
    const businessName = field('businessName');
    const whatsappNumber = field('whatsappNumber');
    const addressLine1 = field('addressLine1');
    const addressCity = field('addressCity');
    const addressLatitude = field('addressLatitude');
    const addressLongitude = field('addressLongitude');
    const vehicleType = field('vehicleType');
    const vehicleRegistration = field('vehicleRegistration');
    const vehicleMake = field('vehicleMake');
    const vehicleModel = field('vehicleModel');
    const vehicleColor = field('vehicleColor');
    const vehicleCapacity = field('vehicleCapacity');
    const vehicleCapacityUnit = field('vehicleCapacityUnit');

    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        ...draft,
        role: roleDetails[selectedRole].apiRole,
        ...(farmName ? { farmName } : {}),
        ...(businessName ? { businessName } : {}),
        ...(whatsappNumber ? { whatsappNumber } : {}),
        ...(addressLine1 && addressCity && addressLatitude && addressLongitude
          ? { address: { line1: addressLine1, city: addressCity, latitude: addressLatitude, longitude: addressLongitude } }
          : {}),
        ...(selectedRole === 'Transporter' && vehicleType && vehicleRegistration
          ? {
              vehicle: {
                type: vehicleType as VehicleTypeCode,
                registrationNumber: vehicleRegistration,
                ...(vehicleMake ? { make: vehicleMake } : {}),
                ...(vehicleModel ? { model: vehicleModel } : {}),
                ...(vehicleColor ? { color: vehicleColor } : {}),
                ...(vehicleCapacity && vehicleCapacityUnit ? { capacity: vehicleCapacity, capacityUnit: vehicleCapacityUnit } : {}),
              },
            }
          : {}),
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

        {selectedRole === 'Farmer' ? <>
          <AuthFormField label="Farm name" name="farmName" required minLength={2} maxLength={180} placeholder="Green Valley Farm" />
          <AuthFormField label="WhatsApp number (optional)" name="whatsappNumber" type="tel" minLength={7} maxLength={32} placeholder="+94 77 123 4567" />
          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-900">Pickup address</p>
            <p className="mb-3 text-xs text-slate-500">This is where transporters will collect orders. Coordinates are entered manually for now — enter your farm&apos;s approximate latitude/longitude.</p>
            <div className="space-y-3">
              <AuthFormField label="Address line" name="addressLine1" required maxLength={255} placeholder="123 Farm Road" />
              <AuthFormField label="City" name="addressCity" required maxLength={120} placeholder="Kandy" />
              <div className="grid gap-3 sm:grid-cols-2">
                <AuthFormField label="Latitude" name="addressLatitude" type="text" inputMode="decimal" required placeholder="7.2906" />
                <AuthFormField label="Longitude" name="addressLongitude" type="text" inputMode="decimal" required placeholder="80.6337" />
              </div>
            </div>
          </div>
        </> : null}

        {selectedRole === 'Transporter' ? <>
          <AuthFormField label="Business name (optional)" name="businessName" minLength={2} maxLength={180} placeholder="Reliable Farm Logistics" />
          <AuthFormField label="WhatsApp number (optional)" name="whatsappNumber" type="tel" minLength={7} maxLength={32} placeholder="+94 77 123 4567" />
          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-900">Vehicle details</p>
            <div className="space-y-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Vehicle type</span>
                <Select name="vehicleType" required defaultValue="">
                  <option value="" disabled>Select a vehicle type</option>
                  {VEHICLE_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
              </label>
              <AuthFormField label="Registration / plate number" name="vehicleRegistration" required maxLength={64} placeholder="WP-CAB-1234" />
              <div className="grid gap-3 sm:grid-cols-2">
                <AuthFormField label="Make (optional)" name="vehicleMake" maxLength={80} placeholder="Isuzu" />
                <AuthFormField label="Model (optional)" name="vehicleModel" maxLength={80} placeholder="Elf" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <AuthFormField label="Color (optional)" name="vehicleColor" maxLength={50} placeholder="White" />
                <div className="grid grid-cols-2 gap-2">
                  <AuthFormField label="Capacity (optional)" name="vehicleCapacity" type="text" inputMode="decimal" placeholder="2000" />
                  <AuthFormField label="Unit" name="vehicleCapacityUnit" maxLength={30} placeholder="kg" />
                </div>
              </div>
            </div>
          </div>
        </> : null}

        {selectedRole === 'Buyer' ? <div className="rounded-2xl border border-border bg-slate-50 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <input type="checkbox" checked={wantsBuyerAddress} onChange={(event) => setWantsBuyerAddress(event.target.checked)} className="h-4 w-4 rounded border-border" />
            Add a delivery address now (optional)
          </label>
          {wantsBuyerAddress ? <div className="mt-3 space-y-3">
            <AuthFormField label="Address line" name="addressLine1" required maxLength={255} placeholder="45 Galle Road" />
            <AuthFormField label="City" name="addressCity" required maxLength={120} placeholder="Colombo" />
            <div className="grid gap-3 sm:grid-cols-2">
              <AuthFormField label="Latitude" name="addressLatitude" type="text" inputMode="decimal" required placeholder="6.9271" />
              <AuthFormField label="Longitude" name="addressLongitude" type="text" inputMode="decimal" required placeholder="79.8612" />
            </div>
          </div> : <p className="mt-2 text-xs text-slate-500">You can skip this and add a delivery address later from your profile, or enter one during checkout.</p>}
        </div> : null}

        {error ? <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
        {!draft ? <p className="text-sm text-slate-600">Your account details are not available. Return to the previous step to continue securely.</p> : null}
        <Button size="lg" className="w-full" type="submit" disabled={isSubmitting || !draft}>
          {isSubmitting ? 'Creating account…' : 'Create account'} {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </form>
    </AuthShell>
  );
}
