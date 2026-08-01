export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type UserRole = 'BUYER' | 'FARMER' | 'TRANSPORTER' | 'ADMIN';

export type AuthUser = {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: string;
  emailVerifiedAt: string | null;
  profile: {
    firstName: string;
    lastName: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type Category = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  width: number;
  height: number;
};

export type Product = {
  id: string;
  farmerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  unit: string;
  unitPrice: string;
  currency: string;
  minOrderQuantity: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  category: Category;
  farmer: {
    id: string;
    farmName: string;
    user: {
      id: string;
      profile: {
        displayName: string | null;
        avatarUrl: string | null;
      } | null;
    };
  };
  images: ProductImage[];
  inventory: {
    quantityOnHand: string;
    quantityReserved: string;
    reorderLevel: string | null;
  } | null;
};

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type Inventory = {
  id: string;
  productId: string;
  quantityOnHand: string;
  quantityReserved: string;
  reorderLevel: string | null;
  updatedAt: string;
  product: Pick<Product, 'id' | 'name' | 'unit' | 'status'>;
};

export type InventoryMovement = {
  id: string;
  type: 'STOCK_IN' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGE' | 'EXPIRY' | 'RESERVATION' | 'RELEASE' | 'SALE';
  quantity: string;
  balanceAfter: string;
  reason: string | null;
  createdAt: string;
};

export type ProductSort = 'newest' | 'oldest' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc';

export type ProductQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: string;
  maxPrice?: string;
  sort?: ProductSort;
};
