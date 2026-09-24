import { Role, VehicleType } from '@prisma/client';
import { z } from 'zod';

const request = <TBody extends z.ZodType>(body: TBody) =>
  z.object({ body, params: z.object({}).strict(), query: z.object({}).strict() });

const passwordSchema = z
  .string()
  .min(12)
  .max(128)
  .regex(/[a-z]/, 'Password must contain a lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
  .regex(/\d/, 'Password must contain a number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a symbol.');

const latitude = z.string().regex(/^-?\d+(\.\d{1,7})?$/).refine(value => Number(value) >= -90 && Number(value) <= 90, 'Latitude must be between -90 and 90.');
const longitude = z.string().regex(/^-?\d+(\.\d{1,7})?$/).refine(value => Number(value) >= -180 && Number(value) <= 180, 'Longitude must be between -180 and 180.');
const decimal = z.string().regex(/^\d+(\.\d{1,3})?$/).refine(value => Number(value) > 0);

const registerAddressSchema = z.object({
  line1: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(120),
  latitude,
  longitude,
});
const registerVehicleSchema = z.object({
  type: z.nativeEnum(VehicleType),
  registrationNumber: z.string().trim().min(2).max(64).transform(value => value.toUpperCase()),
  make: z.string().trim().max(80).optional(),
  model: z.string().trim().max(80).optional(),
  color: z.string().trim().max(50).optional(),
  capacity: decimal.optional(),
  capacityUnit: z.string().trim().min(1).max(30).optional(),
}).refine(value => Boolean(value.capacity) === Boolean(value.capacityUnit), 'Capacity and capacity unit must be provided together.');

export const registerBodySchema = z
  .object({
    email: z.string().email().max(320).transform((value) => value.toLowerCase()),
    password: passwordSchema,
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(7).max(32),
    role: z.enum([Role.BUYER, Role.FARMER, Role.TRANSPORTER]),
    farmName: z.string().trim().min(2).max(180).optional(),
    businessName: z.string().trim().min(2).max(180).optional(),
    whatsappNumber: z.string().trim().min(7).max(32).optional(),
    address: registerAddressSchema.optional(),
    vehicle: registerVehicleSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.role === Role.FARMER && !value.farmName) {
      context.addIssue({ code: 'custom', path: ['farmName'], message: 'Farm name is required for farmers.' });
    }
    if (value.role === Role.FARMER && !value.address) {
      context.addIssue({ code: 'custom', path: ['address'], message: 'A pickup address is required for farmers.' });
    }
    if (value.role === Role.TRANSPORTER && !value.vehicle) {
      context.addIssue({ code: 'custom', path: ['vehicle'], message: 'Vehicle details are required for transporters.' });
    }
  });

export const registerSchema = request(registerBodySchema);
export const loginSchema = request(
  z.object({
    email: z.string().email().max(320).transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(128),
  }),
);
export const refreshSchema = request(z.object({ refreshToken: z.string().min(1) }));
export const logoutSchema = refreshSchema;
export const verifyEmailSchema = request(z.object({ token: z.string().length(64) }));
export const forgotPasswordSchema = request(
  z.object({ email: z.string().email().max(320).transform((value) => value.toLowerCase()) }),
);
export const resetPasswordSchema = request(
  z.object({ token: z.string().length(64), password: passwordSchema }),
);

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginSchema>['body'];
export type RefreshBody = z.infer<typeof refreshSchema>['body'];
export type VerifyEmailBody = z.infer<typeof verifyEmailSchema>['body'];
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>['body'];
