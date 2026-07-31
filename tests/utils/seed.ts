import { AccountStatus, Role, VerificationStatus, type PrismaClient } from '@prisma/client';
import { passwordUtility } from '../../src/utils/password';

export async function seedTestDatabase(database: PrismaClient) {
  const passwordHash = await passwordUtility.hash('TestPassword!123');
  const buyer = await database.user.create({ data: { email: 'buyer@test.agrilink.local', passwordHash, role: Role.BUYER, status: AccountStatus.ACTIVE, emailVerifiedAt: new Date(), profile: { create: { firstName: 'Test', lastName: 'Buyer' } }, buyerProfile: { create: {} } } });
  const farmer = await database.user.create({ data: { email: 'farmer@test.agrilink.local', passwordHash, role: Role.FARMER, status: AccountStatus.ACTIVE, emailVerifiedAt: new Date(), profile: { create: { firstName: 'Test', lastName: 'Farmer' } }, farmerProfile: { create: { farmName: 'Test Farm', verificationStatus: VerificationStatus.APPROVED } } }, include: { farmerProfile: true } });
  const category = await database.category.create({ data: { name: 'Test Produce', slug: 'test-produce' } });
  const product = await database.product.create({ data: { farmerId: farmer.farmerProfile!.id, categoryId: category.id, name: 'Test Tomatoes', slug: 'test-tomatoes', description: 'Test product', unit: 'kg', unitPrice: 10, currency: 'USD', minOrderQuantity: 1, inventory: { create: { quantityOnHand: 100 } } } });
  return { buyer, farmer, category, product };
}
