import { apiRequest } from './client';

export type Address = {
  id: string;
  label: string | null;
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2: string | null;
  city: string;
  district: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string;
  latitude: string | null;
  longitude: string | null;
  isDefault: boolean;
};
export type AddressInput = {
  label?: string;
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2?: string;
  city: string;
  district?: string;
  region?: string;
  postalCode?: string;
  countryCode: string;
  latitude?: string;
  longitude?: string;
  isDefault?: boolean;
};
export type AddressUpdateInput = Partial<AddressInput>;

export type AccountProfile = {
  id: string;
  email: string;
  phone: string | null;
  profile: { firstName: string; lastName: string; displayName: string | null; avatarUrl: string | null } | null;
  farmerProfile: { farmName: string; whatsappNumber: string | null } | null;
  transporterProfile: { businessName: string | null; whatsappNumber: string | null } | null;
  buyerProfile: { id: string } | null;
};
export type ProfileUpdateInput = { phone?: string; whatsappNumber?: string };

export const getAddresses = () => apiRequest<Address[]>('/addresses', { authenticated: true });
export const createAddress = (input: AddressInput) => apiRequest<Address>('/addresses', { method: 'POST', authenticated: true, body: input });
export const updateAddress = (addressId: string, input: AddressUpdateInput) => apiRequest<Address>(`/addresses/${encodeURIComponent(addressId)}`, { method: 'PATCH', authenticated: true, body: input });
export const updateAccountProfile = (input: ProfileUpdateInput) => apiRequest<AccountProfile>('/profile', { method: 'PATCH', authenticated: true, body: input });
