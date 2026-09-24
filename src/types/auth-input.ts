import type { Role, VehicleType } from '@prisma/client';

export interface RegisterAddressInput { line1: string; city: string; latitude: string; longitude: string }
export interface RegisterVehicleInput {
  type: VehicleType;
  registrationNumber: string;
  make?: string;
  model?: string;
  color?: string;
  capacity?: string;
  capacityUnit?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Exclude<Role, 'ADMIN'>;
  farmName?: string;
  businessName?: string;
  whatsappNumber?: string;
  address?: RegisterAddressInput;
  vehicle?: RegisterVehicleInput;
}

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}
