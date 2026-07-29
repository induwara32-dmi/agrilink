import { apiRequest } from './client';
import type { Category, Product, ProductQuery } from './types';

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
