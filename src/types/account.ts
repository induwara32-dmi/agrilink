import type { Role } from '@prisma/client';

export interface AccountActor { userId: string; role: Role; requestId: string }

export interface AddressInput {
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
}
export type AddressUpdateInput = Partial<AddressInput>;
export interface ProfileUpdateInput { phone?: string; whatsappNumber?: string }
