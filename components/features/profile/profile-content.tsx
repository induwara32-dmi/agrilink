'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Select } from '@/components/ui/select';
import { ToastMessage } from '@/components/ui/toast-message';
import { ApiClientError } from '@/lib/api/client';
import { createAddress, getAddresses, updateAccountProfile, updateAddress, type Address } from '@/lib/api/account';
import { createVehicle, listVehicles, updateVehicle, VEHICLE_TYPE_OPTIONS, type VehicleRecord, type VehicleTypeCode } from '@/lib/api/logistics';
import { ProfileImageControl } from '@/components/features/media/profile-image-control';
import { useAuth } from '@/providers/auth-provider';

function field(form: FormData, name: string): string { return String(form.get(name) ?? '').trim(); }

export function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const [toast, setToast] = useState<{ message: string; tone?: 'success' | 'error' } | null>(null);
  const showsAddress = user?.role === 'FARMER' || user?.role === 'BUYER';
  const showsVehicle = user?.role === 'TRANSPORTER';
  const showsWhatsapp = user?.role === 'FARMER' || user?.role === 'TRANSPORTER';

  const addresses = useQuery({ queryKey: ['addresses'], queryFn: getAddresses, enabled: showsAddress });
  const vehicles = useQuery({ queryKey: ['vehicles', 'mine'], queryFn: () => listVehicles(1, 20), enabled: showsVehicle });

  const contactMutation = useMutation({
    mutationFn: (input: { phone?: string; whatsappNumber?: string }) => updateAccountProfile(input),
    onSuccess: async () => { await refreshUser(); setToast({ message: 'Contact details updated.' }); },
    onError: error => setToast({ message: error instanceof ApiClientError ? error.message : 'Unable to update contact details.', tone: 'error' }),
  });

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = field(form, 'phone');
    const whatsappNumber = field(form, 'whatsappNumber');
    contactMutation.mutate({ ...(phone ? { phone } : {}), ...(showsWhatsapp ? { whatsappNumber } : {}) });
  }

  if (!user) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-white">
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{[user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || user.email}</p>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
            <Badge variant="outline" className="capitalize">{user.role.toLowerCase()} account</Badge>
          </div>
          <ProfileImageControl />
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-white">
        <CardHeader><CardTitle>Contact details</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleContactSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Phone</span>
              <Input name="phone" type="tel" defaultValue={user.phone ?? ''} minLength={7} maxLength={32} placeholder="+94 77 123 4567" />
            </label>
            {showsWhatsapp ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">WhatsApp number (optional)</span>
                <Input name="whatsappNumber" type="tel" defaultValue={(user.farmerProfile?.whatsappNumber ?? user.transporterProfile?.whatsappNumber) ?? ''} minLength={7} maxLength={32} placeholder="+94 77 123 4567" />
              </label>
            ) : null}
            <Button type="submit" disabled={contactMutation.isPending}>{contactMutation.isPending ? 'Saving…' : 'Save contact details'}</Button>
          </form>
        </CardContent>
      </Card>

      {showsAddress ? <AddressCard addresses={addresses.data?.data} isLoading={addresses.isLoading} required={user.role === 'FARMER'} onToast={setToast} /> : null}
      {showsVehicle ? <VehicleCard vehicles={vehicles.data?.data} isLoading={vehicles.isLoading} onToast={setToast} /> : null}

      {toast ? <ToastMessage {...toast} /> : null}
    </div>
  );
}

function AddressCard({ addresses, isLoading, required, onToast }: { addresses: Address[] | undefined; isLoading: boolean; required: boolean; onToast: (toast: { message: string; tone?: 'success' | 'error' }) => void }) {
  const client = useQueryClient();
  const existing = addresses?.[0] ?? null;

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof createAddress>[0]) => createAddress(input),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['addresses'] }); onToast({ message: 'Address saved.' }); },
    onError: error => onToast({ message: error instanceof ApiClientError ? error.message : 'Unable to save address.', tone: 'error' }),
  });
  const updateMutation = useMutation({
    mutationFn: (input: { addressId: string; body: Parameters<typeof updateAddress>[1] }) => updateAddress(input.addressId, input.body),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['addresses'] }); onToast({ message: 'Address updated.' }); },
    onError: error => onToast({ message: error instanceof ApiClientError ? error.message : 'Unable to update address.', tone: 'error' }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      recipientName: field(form, 'recipientName'),
      recipientPhone: field(form, 'recipientPhone'),
      line1: field(form, 'line1'),
      city: field(form, 'city'),
      countryCode: field(form, 'countryCode') || 'LK',
      ...(field(form, 'latitude') ? { latitude: field(form, 'latitude') } : {}),
      ...(field(form, 'longitude') ? { longitude: field(form, 'longitude') } : {}),
    };
    if (existing) updateMutation.mutate({ addressId: existing.id, body });
    else createMutation.mutate(body);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-border/80 bg-white">
      <CardHeader><CardTitle>{required ? 'Pickup address' : 'Delivery address'}</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <LoadingSkeleton /> : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Recipient name</span><Input name="recipientName" required defaultValue={existing?.recipientName} maxLength={180} /></label>
              <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Recipient phone</span><Input name="recipientPhone" type="tel" required defaultValue={existing?.recipientPhone} maxLength={32} /></label>
            </div>
            <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Address line</span><Input name="line1" required defaultValue={existing?.line1} maxLength={255} /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">City</span><Input name="city" required defaultValue={existing?.city} maxLength={120} /></label>
              <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Country code</span><Input name="countryCode" defaultValue={existing?.countryCode ?? 'LK'} maxLength={2} /></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Latitude</span><Input name="latitude" type="text" inputMode="decimal" defaultValue={existing?.latitude ?? ''} placeholder="7.2906" /></label>
              <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Longitude</span><Input name="longitude" type="text" inputMode="decimal" defaultValue={existing?.longitude ?? ''} placeholder="80.6337" /></label>
            </div>
            <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : existing ? 'Update address' : 'Save address'}</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function VehicleCard({ vehicles, isLoading, onToast }: { vehicles: VehicleRecord[] | undefined; isLoading: boolean; onToast: (toast: { message: string; tone?: 'success' | 'error' }) => void }) {
  const client = useQueryClient();
  const existing = vehicles?.[0] ?? null;

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof createVehicle>[0]) => createVehicle(input),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['vehicles', 'mine'] }); onToast({ message: 'Vehicle saved.' }); },
    onError: error => onToast({ message: error instanceof ApiClientError ? error.message : 'Unable to save vehicle.', tone: 'error' }),
  });
  const updateMutation = useMutation({
    mutationFn: (input: { vehicleId: string; body: Parameters<typeof updateVehicle>[1] }) => updateVehicle(input.vehicleId, input.body),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['vehicles', 'mine'] }); onToast({ message: 'Vehicle updated.' }); },
    onError: error => onToast({ message: error instanceof ApiClientError ? error.message : 'Unable to update vehicle.', tone: 'error' }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const make = field(form, 'make');
    const model = field(form, 'model');
    const color = field(form, 'color');
    const capacity = field(form, 'capacity');
    const capacityUnit = field(form, 'capacityUnit');
    const body = {
      type: field(form, 'type') as VehicleTypeCode,
      registrationNumber: field(form, 'registrationNumber'),
      ...(make ? { make } : {}),
      ...(model ? { model } : {}),
      ...(color ? { color } : {}),
      ...(capacity && capacityUnit ? { capacity, capacityUnit } : {}),
    };
    if (existing) updateMutation.mutate({ vehicleId: existing.id, body });
    else createMutation.mutate(body as Parameters<typeof createVehicle>[0]);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-border/80 bg-white">
      <CardHeader><CardTitle>Vehicle</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <LoadingSkeleton /> : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Vehicle type</span>
              <Select name="type" required defaultValue={existing?.type ?? ''}>
                <option value="" disabled>Select a vehicle type</option>
                {VEHICLE_TYPE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            </label>
            <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Registration / plate number</span><Input name="registrationNumber" required defaultValue={existing?.registrationNumber} maxLength={64} disabled={Boolean(existing)} /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Make (optional)</span><Input name="make" defaultValue={existing?.make ?? ''} maxLength={80} /></label>
              <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Model (optional)</span><Input name="model" defaultValue={existing?.model ?? ''} maxLength={80} /></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Color (optional)</span><Input name="color" defaultValue={existing?.color ?? ''} maxLength={50} /></label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Capacity (optional)</span><Input name="capacity" type="text" inputMode="decimal" defaultValue={existing?.capacity ?? ''} placeholder="2000" /></label>
                <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Unit</span><Input name="capacityUnit" defaultValue={existing?.capacityUnit ?? ''} maxLength={30} placeholder="kg" /></label>
              </div>
            </div>
            {existing ? <p className="text-xs text-slate-500">The registration number cannot be changed once a vehicle is saved.</p> : null}
            <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : existing ? 'Update vehicle' : 'Save vehicle'}</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
