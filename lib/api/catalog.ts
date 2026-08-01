import { apiRequest } from './client';
import type { Category, Inventory, InventoryMovement, Product, ProductQuery, ProductStatus } from './types';

export const catalogQueryKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogQueryKeys.all, 'categories'] as const,
  managedProducts: (query: ProductQuery) => [...catalogQueryKeys.all, 'managed-products', query] as const,
  product: (id: string) => [...catalogQueryKeys.all, 'product', id] as const,
  inventory: (id: string) => [...catalogQueryKeys.all, 'inventory', id] as const,
};

export type ProductInput = {
  categoryId: string;
  name: string;
  description: string;
  unit: string;
  unitPrice: string;
  currency: string;
  minOrderQuantity: string;
  status: ProductStatus;
  initialQuantity?: string;
  reorderLevel?: string;
};

function queryString(query: ProductQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const value = params.toString();
  return value ? `?${value}` : '';
}

export function getCategories() {
  return apiRequest<Category[]>('/categories');
}

export function getProducts(query: ProductQuery = {}) {
  return apiRequest<Product[]>(`/products${queryString(query)}`);
}

export function getProduct(id: string) {
  return apiRequest<Product>(`/products/${encodeURIComponent(id)}`);
}

export function getManagedProducts(query: ProductQuery = {}) {
  return apiRequest<Product[]>(`/management/products${queryString(query)}`, { authenticated: true });
}

export function getManagedProduct(id: string) {
  return apiRequest<Product>(`/management/products/${encodeURIComponent(id)}`, { authenticated: true });
}

export function createProduct(input: ProductInput) {
  return apiRequest<Product>('/products', { method: 'POST', body: input, authenticated: true });
}

export function updateProduct(id: string, input: Omit<ProductInput, 'initialQuantity' | 'reorderLevel'>) {
  return apiRequest<Product>(`/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: input, authenticated: true });
}

export function deleteProduct(id: string) {
  return apiRequest<{ message: string }>(`/products/${encodeURIComponent(id)}`, { method: 'DELETE', authenticated: true });
}

export function getInventory(productId: string) {
  return apiRequest<Inventory>(`/products/${encodeURIComponent(productId)}/inventory`, { authenticated: true });
}

export function updateInventoryThreshold(productId: string, reorderLevel: string | null) {
  return apiRequest<Inventory>(`/products/${encodeURIComponent(productId)}/inventory`, { method: 'PATCH', body: { reorderLevel }, authenticated: true });
}

export function adjustInventory(productId: string, input: { type: 'STOCK_IN' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGE' | 'EXPIRY'; quantity: string; reason?: string }) {
  return apiRequest<Inventory>(`/products/${encodeURIComponent(productId)}/inventory/adjustments`, { method: 'POST', body: input, authenticated: true });
}

export function getInventoryHistory(productId: string, page = 1, pageSize = 20) {
  return apiRequest<InventoryMovement[]>(`/products/${encodeURIComponent(productId)}/inventory/history?page=${page}&pageSize=${pageSize}`, { authenticated: true });
}
