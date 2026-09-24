import { Prisma, Role } from '@prisma/client';
import { HTTP_STATUS } from '../constants/application';
import type { AccountRepository } from '../repositories/account.repository';
import type { AccountActor, AddressInput, AddressUpdateInput, ProfileUpdateInput } from '../types/account';
import { ApiError } from '../utils/api-error';
import { BaseService } from './base.service';

export class AccountService extends BaseService {
  public constructor(private readonly repository: AccountRepository) { super(); }

  public listAddresses(actor: AccountActor) { return this.repository.listAddresses(actor.userId); }

  public async createAddress(input: AddressInput, actor: AccountActor) {
    try { return await this.repository.createAddress(actor.userId, input); } catch (error) { this.translate(error); }
  }

  public async updateAddress(addressId: string, input: AddressUpdateInput, actor: AccountActor) {
    try { return await this.repository.updateAddress(actor.userId, addressId, input); } catch (error) { this.translate(error); }
  }

  public async updateProfile(input: ProfileUpdateInput, actor: AccountActor) {
    if (input.whatsappNumber !== undefined && actor.role !== Role.FARMER && actor.role !== Role.TRANSPORTER) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'WHATSAPP_NOT_SUPPORTED', 'A WhatsApp number can only be set for farmer or transporter accounts.');
    }
    try { return await this.repository.updateProfile(actor.userId, actor.role, input); } catch (error) { this.translate(error); }
  }

  private translate(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ApiError(HTTP_STATUS.CONFLICT, 'PHONE_ALREADY_IN_USE', 'That phone number is already associated with another account.');
    if (error instanceof Error && error.message === 'ADDRESS_NOT_FOUND') throw new ApiError(HTTP_STATUS.NOT_FOUND, 'ADDRESS_NOT_FOUND', 'Address not found.');
    throw error;
  }
}
