import { Prisma, type PrismaClient, type Role } from '@prisma/client';
import type { AddressInput, AddressUpdateInput } from '../types/account';
import { BaseRepository } from './base.repository';

export class AccountRepository extends BaseRepository {
  public constructor(database: PrismaClient) { super(database); }

  public listAddresses(userId: string) {
    return this.database.address.findMany({ where: { userId, deletedAt: null }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] });
  }

  public async createAddress(userId: string, input: AddressInput) {
    return this.database.$transaction(async transaction => {
      const existingCount = await transaction.address.count({ where: { userId, deletedAt: null } });
      const makeDefault = input.isDefault ?? existingCount === 0;
      if (makeDefault) await transaction.address.updateMany({ where: { userId, deletedAt: null, isDefault: true }, data: { isDefault: false } });
      return transaction.address.create({
        data: {
          userId,
          ...(input.label ? { label: input.label } : {}),
          recipientName: input.recipientName,
          recipientPhone: input.recipientPhone,
          line1: input.line1,
          ...(input.line2 ? { line2: input.line2 } : {}),
          city: input.city,
          ...(input.district ? { district: input.district } : {}),
          ...(input.region ? { region: input.region } : {}),
          ...(input.postalCode ? { postalCode: input.postalCode } : {}),
          countryCode: input.countryCode,
          ...(input.latitude !== undefined ? { latitude: new Prisma.Decimal(input.latitude) } : {}),
          ...(input.longitude !== undefined ? { longitude: new Prisma.Decimal(input.longitude) } : {}),
          isDefault: makeDefault,
        },
      });
    });
  }

  public async updateAddress(userId: string, addressId: string, input: AddressUpdateInput) {
    return this.database.$transaction(async transaction => {
      const existing = await transaction.address.findFirst({ where: { id: addressId, userId, deletedAt: null } });
      if (!existing) throw new Error('ADDRESS_NOT_FOUND');
      if (input.isDefault) await transaction.address.updateMany({ where: { userId, deletedAt: null, isDefault: true, id: { not: addressId } }, data: { isDefault: false } });
      return transaction.address.update({
        where: { id: addressId },
        data: {
          ...(input.label !== undefined ? { label: input.label } : {}),
          ...(input.recipientName !== undefined ? { recipientName: input.recipientName } : {}),
          ...(input.recipientPhone !== undefined ? { recipientPhone: input.recipientPhone } : {}),
          ...(input.line1 !== undefined ? { line1: input.line1 } : {}),
          ...(input.line2 !== undefined ? { line2: input.line2 } : {}),
          ...(input.city !== undefined ? { city: input.city } : {}),
          ...(input.district !== undefined ? { district: input.district } : {}),
          ...(input.region !== undefined ? { region: input.region } : {}),
          ...(input.postalCode !== undefined ? { postalCode: input.postalCode } : {}),
          ...(input.countryCode !== undefined ? { countryCode: input.countryCode } : {}),
          ...(input.latitude !== undefined ? { latitude: new Prisma.Decimal(input.latitude) } : {}),
          ...(input.longitude !== undefined ? { longitude: new Prisma.Decimal(input.longitude) } : {}),
          ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
        },
      });
    });
  }

  public async updateProfile(userId: string, role: Role, input: { phone?: string; whatsappNumber?: string }) {
    return this.database.$transaction(async transaction => {
      if (input.phone !== undefined) await transaction.user.update({ where: { id: userId }, data: { phone: input.phone } });
      if (input.whatsappNumber !== undefined) {
        if (role === 'FARMER') await transaction.farmerProfile.update({ where: { userId }, data: { whatsappNumber: input.whatsappNumber } });
        else if (role === 'TRANSPORTER') await transaction.transporterProfile.update({ where: { userId }, data: { whatsappNumber: input.whatsappNumber } });
      }
      return transaction.user.findUniqueOrThrow({
        where: { id: userId },
        include: { profile: true, farmerProfile: true, transporterProfile: true, buyerProfile: true },
      });
    });
  }
}
