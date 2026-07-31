import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import YAML from 'yaml';

const apiPrefix = '/api/v1';
const json = (schema, example) => ({
  required: true,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` }, example } },
});
const multipart = (properties, required = ['file']) => ({
  required: true,
  content: { 'multipart/form-data': { schema: { type: 'object', properties, required } } },
});
const page = ['page', 'pageSize'];
const endpoint = (method, path, tag, summary, options = {}) => ({ method, path, tag, summary, ...options });

const endpoints = [
  endpoint('get', '/health', 'System', 'Check API liveness', { public: true }),
  endpoint('get', '/readiness', 'System', 'Check database readiness', { public: true }),
  endpoint('get', '/version', 'System', 'Get application version', { public: true }),
  endpoint('post', '/auth/register', 'Authentication', 'Register a buyer, farmer, or transporter', { public: true, status: 201, body: json('RegisterRequest', { email: 'buyer@example.com', password: 'StrongPass!123', firstName: 'Asha', lastName: 'Perera', role: 'BUYER' }) }),
  endpoint('post', '/auth/login', 'Authentication', 'Log in', { public: true, body: json('LoginRequest', { email: 'buyer@example.com', password: 'StrongPass!123' }) }),
  endpoint('post', '/auth/logout', 'Authentication', 'Revoke a refresh session', { public: true, body: json('RefreshTokenRequest', { refreshToken: '{{refreshToken}}' }) }),
  endpoint('post', '/auth/refresh', 'Authentication', 'Rotate a refresh token', { public: true, body: json('RefreshTokenRequest', { refreshToken: '{{refreshToken}}' }) }),
  endpoint('post', '/auth/verify-email', 'Authentication', 'Verify an email address', { public: true, body: json('TokenRequest', { token: '{{verificationToken}}' }) }),
  endpoint('post', '/auth/forgot-password', 'Authentication', 'Request a password reset', { public: true, body: json('EmailRequest', { email: 'buyer@example.com' }) }),
  endpoint('post', '/auth/reset-password', 'Authentication', 'Reset a password', { public: true, body: json('ResetPasswordRequest', { token: '{{resetToken}}', password: 'NewStrongPass!123' }) }),
  endpoint('get', '/auth/me', 'Authentication', 'Get the authenticated user'),

  endpoint('get', '/products', 'Catalog', 'List public products', { public: true, query: [...page, 'search', 'categoryId', 'farmerId', 'status', 'minPrice', 'maxPrice', 'sort'] }),
  endpoint('get', '/search', 'Catalog', 'Search public products', { public: true, query: [...page, 'search', 'categoryId', 'farmerId', 'status', 'minPrice', 'maxPrice', 'sort'] }),
  endpoint('get', '/products/{id}', 'Catalog', 'Get a public product', { public: true, pathParams: ['id'] }),
  endpoint('get', '/categories', 'Catalog', 'List active categories', { public: true, query: ['includeInactive'] }),
  endpoint('get', '/categories/{id}', 'Catalog', 'Get a category', { public: true, pathParams: ['id'] }),
  endpoint('get', '/management/products', 'Catalog', 'List managed products', { roles: ['FARMER', 'ADMIN'], query: [...page, 'search', 'categoryId', 'farmerId', 'status', 'minPrice', 'maxPrice', 'sort'] }),
  endpoint('post', '/products', 'Catalog', 'Create a product', { roles: ['FARMER', 'ADMIN'], status: 201, body: json('ProductRequest', { categoryId: '{{categoryId}}', name: 'Organic Tomatoes', description: 'Freshly harvested organic tomatoes.', unit: 'kg', unitPrice: '4.50', currency: 'USD', initialQuantity: '100' }) }),
  endpoint('patch', '/products/{id}', 'Catalog', 'Update a product', { roles: ['FARMER', 'ADMIN'], pathParams: ['id'], body: json('ProductUpdateRequest', { name: 'Premium Organic Tomatoes', unitPrice: '4.75' }) }),
  endpoint('delete', '/products/{id}', 'Catalog', 'Soft-delete a product', { roles: ['FARMER', 'ADMIN'], pathParams: ['id'] }),
  endpoint('get', '/products/{id}/inventory', 'Inventory', 'Get product inventory', { roles: ['FARMER', 'ADMIN'], pathParams: ['id'] }),
  endpoint('patch', '/products/{id}/inventory', 'Inventory', 'Update reorder level', { roles: ['FARMER', 'ADMIN'], pathParams: ['id'], body: json('InventorySettingsRequest', { reorderLevel: '10' }) }),
  endpoint('post', '/products/{id}/inventory/adjustments', 'Inventory', 'Adjust product inventory', { roles: ['FARMER', 'ADMIN'], pathParams: ['id'], body: json('InventoryAdjustmentRequest', { type: 'STOCK_IN', quantity: '25', reason: 'Harvest received' }) }),
  endpoint('get', '/products/{id}/inventory/history', 'Inventory', 'List inventory movements', { roles: ['FARMER', 'ADMIN'], pathParams: ['id'], query: page }),
  endpoint('get', '/inventory/low-stock', 'Inventory', 'List low-stock products', { roles: ['FARMER', 'ADMIN'], query: page }),
  endpoint('get', '/admin/categories', 'Catalog', 'List categories for administration', { roles: ['ADMIN'], query: ['includeInactive'] }),
  endpoint('post', '/categories', 'Catalog', 'Create a category', { roles: ['ADMIN'], status: 201, body: json('CategoryRequest', { name: 'Vegetables', description: 'Fresh vegetables', sortOrder: 10 }) }),
  endpoint('patch', '/categories/{id}', 'Catalog', 'Update a category', { roles: ['ADMIN'], pathParams: ['id'], body: json('CategoryUpdateRequest', { name: 'Leafy Vegetables', isActive: true }) }),
  endpoint('delete', '/categories/{id}', 'Catalog', 'Soft-delete a category', { roles: ['ADMIN'], pathParams: ['id'] }),

  endpoint('get', '/cart', 'Cart and checkout', 'Get the buyer cart', { roles: ['BUYER'] }),
  endpoint('post', '/cart/items', 'Cart and checkout', 'Add a cart item', { roles: ['BUYER'], status: 201, body: json('CartItemRequest', { productId: '{{productId}}', quantity: '2', deliveryMethod: 'PLATFORM_TRANSPORTER' }) }),
  endpoint('patch', '/cart/items/{itemId}', 'Cart and checkout', 'Update a cart item', { roles: ['BUYER'], pathParams: ['itemId'], body: json('CartItemUpdateRequest', { quantity: '3', savedForLater: false }) }),
  endpoint('post', '/cart/items/{itemId}/save-for-later', 'Cart and checkout', 'Save a cart item for later', { roles: ['BUYER'], pathParams: ['itemId'] }),
  endpoint('delete', '/cart/items/{itemId}', 'Cart and checkout', 'Remove a cart item', { roles: ['BUYER'], pathParams: ['itemId'] }),
  endpoint('delete', '/cart', 'Cart and checkout', 'Clear the cart', { roles: ['BUYER'] }),
  endpoint('post', '/checkout/preview', 'Cart and checkout', 'Preview server-calculated checkout totals', { roles: ['BUYER'], body: json('CheckoutPreviewRequest', { groups: [{ farmerId: '{{farmerId}}', deliveryMethod: 'PLATFORM_TRANSPORTER', deliveryAddress: { recipientName: 'Asha Perera', recipientPhone: '+94111234567', line1: '10 Farm Road', city: 'Colombo', countryCode: 'LK' } }], couponCode: 'WELCOME10' }) }),
  endpoint('post', '/checkout', 'Cart and checkout', 'Create a transactional multi-farmer order', { roles: ['BUYER'], status: 201, body: json('CheckoutRequest', { groups: [{ farmerId: '{{farmerId}}', deliveryMethod: 'BUYER_PICKUP' }], paymentProvider: 'placeholder' }) }),
  endpoint('get', '/orders', 'Orders', 'List role-scoped orders', { roles: ['BUYER', 'FARMER', 'ADMIN'], query: [...page, 'search', 'status'] }),
  endpoint('get', '/orders/{orderId}', 'Orders', 'Get an order', { roles: ['BUYER', 'FARMER', 'ADMIN'], pathParams: ['orderId'] }),
  endpoint('post', '/orders/{orderId}/cancel', 'Orders', 'Cancel an eligible pending buyer order', { roles: ['BUYER'], pathParams: ['orderId'] }),

  endpoint('get', '/transport-jobs', 'Logistics', 'List transport jobs', { roles: ['TRANSPORTER', 'ADMIN'], query: page }),
  endpoint('get', '/transport-jobs/{jobId}', 'Logistics', 'Get a transport job', { roles: ['TRANSPORTER', 'ADMIN'], pathParams: ['jobId'] }),
  endpoint('post', '/transport-jobs/{jobId}/assign/automatic', 'Logistics', 'Automatically assign a transport job', { roles: ['ADMIN'], pathParams: ['jobId'] }),
  endpoint('post', '/transport-jobs/{jobId}/assign/manual', 'Logistics', 'Manually assign a transport job', { roles: ['ADMIN'], pathParams: ['jobId'], body: json('AssignmentRequest', { transporterId: '{{transporterId}}', vehicleId: '{{vehicleId}}' }) }),
  endpoint('post', '/transport-jobs/{jobId}/reassign', 'Logistics', 'Reassign a transport job', { roles: ['ADMIN'], pathParams: ['jobId'], body: json('AssignmentRequest', { transporterId: '{{transporterId}}', vehicleId: '{{vehicleId}}' }) }),
  endpoint('post', '/transport-jobs/{jobId}/accept', 'Logistics', 'Accept an assigned transport job', { roles: ['TRANSPORTER'], pathParams: ['jobId'], body: json('JobAcceptanceRequest', { vehicleId: '{{vehicleId}}' }) }),
  endpoint('post', '/transport-jobs/{jobId}/reject', 'Logistics', 'Reject an assigned transport job', { roles: ['TRANSPORTER'], pathParams: ['jobId'], body: json('JobRejectionRequest', { reason: 'Schedule conflict' }) }),
  endpoint('get', '/deliveries', 'Logistics', 'List role-scoped deliveries', { roles: ['BUYER', 'FARMER', 'TRANSPORTER', 'ADMIN'], query: page }),
  endpoint('get', '/deliveries/{deliveryId}', 'Logistics', 'Get a delivery and tracking history', { roles: ['BUYER', 'FARMER', 'TRANSPORTER', 'ADMIN'], pathParams: ['deliveryId'] }),
  endpoint('post', '/deliveries/{deliveryId}/schedule', 'Logistics', 'Schedule delivery pickup', { roles: ['BUYER', 'FARMER', 'TRANSPORTER', 'ADMIN'], pathParams: ['deliveryId'], body: json('DeliveryScheduleRequest', { scheduledPickupAt: '2030-01-15T09:00:00.000Z', vehicleId: '{{vehicleId}}' }) }),
  endpoint('post', '/deliveries/{deliveryId}/transitions', 'Logistics', 'Transition a delivery', { roles: ['BUYER', 'FARMER', 'TRANSPORTER', 'ADMIN'], pathParams: ['deliveryId'], body: json('DeliveryTransitionRequest', { status: 'IN_TRANSIT', note: 'Departed pickup location' }) }),
  endpoint('get', '/vehicles', 'Vehicles', 'List vehicles', { roles: ['BUYER', 'FARMER', 'TRANSPORTER', 'ADMIN'], query: page }),
  endpoint('get', '/vehicles/{vehicleId}', 'Vehicles', 'Get a vehicle', { roles: ['BUYER', 'FARMER', 'TRANSPORTER', 'ADMIN'], pathParams: ['vehicleId'] }),
  endpoint('post', '/vehicles', 'Vehicles', 'Register a vehicle', { roles: ['BUYER', 'FARMER', 'TRANSPORTER', 'ADMIN'], status: 201, body: json('VehicleRequest', { type: 'PICKUP_TRUCK', registrationNumber: 'WP-ABC-1234', capacity: '1000', capacityUnit: 'kg' }) }),
  endpoint('patch', '/vehicles/{vehicleId}', 'Vehicles', 'Update a vehicle', { roles: ['BUYER', 'FARMER', 'TRANSPORTER', 'ADMIN'], pathParams: ['vehicleId'], body: json('VehicleUpdateRequest', { isActive: true, capacity: '1200', capacityUnit: 'kg' }) }),
  endpoint('delete', '/vehicles/{vehicleId}', 'Vehicles', 'Soft-delete a vehicle', { roles: ['BUYER', 'FARMER', 'TRANSPORTER', 'ADMIN'], pathParams: ['vehicleId'] }),

  endpoint('get', '/notifications', 'Notifications', 'List notifications', { query: [...page, 'status', 'type'] }),
  endpoint('post', '/notifications', 'Notifications', 'Create an administrative notification', { roles: ['ADMIN'], status: 201, body: json('NotificationRequest', { recipientId: '{{recipientId}}', type: 'SYSTEM', channels: ['IN_APP'], title: 'Platform update', body: 'A platform update is available.' }) }),
  endpoint('get', '/notifications/unread-count', 'Notifications', 'Get unread notification count'),
  endpoint('post', '/notifications/mark-all-read', 'Notifications', 'Mark all notifications read'),
  endpoint('get', '/notifications/{notificationId}', 'Notifications', 'Get a notification', { pathParams: ['notificationId'] }),
  endpoint('patch', '/notifications/{notificationId}', 'Notifications', 'Update notification status', { pathParams: ['notificationId'], body: json('NotificationUpdateRequest', { status: 'ARCHIVED' }) }),
  endpoint('post', '/notifications/{notificationId}/read', 'Notifications', 'Mark a notification read', { pathParams: ['notificationId'] }),
  endpoint('delete', '/notifications/{notificationId}', 'Notifications', 'Soft-delete a notification', { pathParams: ['notificationId'] }),

  endpoint('get', '/analytics/buyer', 'Analytics', 'Get buyer analytics', { roles: ['BUYER'], query: ['period', 'from', 'to'] }),
  endpoint('get', '/analytics/farmer', 'Analytics', 'Get farmer analytics', { roles: ['FARMER'], query: ['period', 'from', 'to'] }),
  endpoint('get', '/analytics/transporter', 'Analytics', 'Get transporter analytics', { roles: ['TRANSPORTER'], query: ['period', 'from', 'to'] }),
  endpoint('get', '/analytics/admin', 'Analytics', 'Get platform analytics', { roles: ['ADMIN'], query: ['period', 'from', 'to'] }),

  endpoint('post', '/products/{id}/images', 'Media', 'Upload product images', { roles: ['FARMER', 'ADMIN'], pathParams: ['id'], status: 201, body: multipart({ images: { type: 'array', maxItems: 5, items: { type: 'string', format: 'binary' } }, altText: { type: 'string', maxLength: 255 } }, ['images']) }),
  endpoint('put', '/products/{id}/images/reorder', 'Media', 'Reorder product images', { roles: ['FARMER', 'ADMIN'], pathParams: ['id'], body: json('ImageOrderRequest', { imageIds: ['{{imageId}}'] }) }),
  endpoint('patch', '/products/{id}/images/{imageId}/primary', 'Media', 'Set the primary product image', { roles: ['FARMER', 'ADMIN'], pathParams: ['id', 'imageId'] }),
  endpoint('delete', '/products/{id}/images/{imageId}', 'Media', 'Delete a product image', { roles: ['FARMER', 'ADMIN'], pathParams: ['id', 'imageId'] }),
  endpoint('put', '/me/avatar', 'Media', 'Upload or replace the current profile image', { body: multipart({ image: { type: 'string', format: 'binary' } }, ['image']) }),
  endpoint('delete', '/me/avatar', 'Media', 'Delete the current profile image'),
  endpoint('post', '/deliveries/{deliveryId}/proof', 'Media', 'Upload proof of delivery', { roles: ['FARMER', 'TRANSPORTER'], pathParams: ['deliveryId'], body: multipart({ image: { type: 'string', format: 'binary' }, receiverName: { type: 'string', maxLength: 180 }, receiverSignature: { type: 'string', maxLength: 20000 }, notes: { type: 'string', maxLength: 2000 } }, ['image', 'receiverName']) }),
];

const descriptions = {
  page: ['integer', 'Page number, starting at 1'], pageSize: ['integer', 'Items per page (maximum 100)'],
  search: ['string', 'Case-insensitive search text'], categoryId: ['string', 'Category UUID'], farmerId: ['string', 'Farmer profile UUID'],
  status: ['string', 'Resource status filter'], minPrice: ['string', 'Minimum decimal price'], maxPrice: ['string', 'Maximum decimal price'],
  sort: ['string', 'Sort: newest, oldest, priceAsc, priceDesc, nameAsc, or nameDesc'], includeInactive: ['boolean', 'Include inactive records'],
  period: ['string', 'day, week, month, year, or custom'], from: ['string', 'Custom range start (ISO 8601)'], to: ['string', 'Custom range end (ISO 8601)'], type: ['string', 'Resource type filter'],
};
const parameter = (name, location = 'query') => ({
  name, in: location, required: location === 'path', description: descriptions[name]?.[1] ?? `${name} UUID`,
  schema: location === 'path' || name.endsWith('Id') || name === 'id' ? { type: 'string', format: 'uuid' } : { type: descriptions[name]?.[0] ?? 'string' },
});
const successResponse = (status) => ({ description: status === 201 ? 'Resource created' : 'Request succeeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } });
const errorResponses = { '400': { $ref: '#/components/responses/BadRequest' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' }, '409': { $ref: '#/components/responses/Conflict' }, '429': { $ref: '#/components/responses/RateLimited' }, '500': { $ref: '#/components/responses/ServerError' } };
const paths = {};
for (const item of endpoints) {
  paths[item.path] ??= {};
  const status = item.status ?? 200;
  const operationId = `${item.method}${item.path.replace(/[{}]/g, '').split('/').filter(Boolean).map(value => value[0].toUpperCase() + value.slice(1).replaceAll('-', '')).join('')}`;
  paths[item.path][item.method] = {
    tags: [item.tag], summary: item.summary, operationId,
    description: item.roles ? `Allowed roles: ${item.roles.join(', ')}. Ownership and lifecycle checks may further restrict access.` : undefined,
    security: item.public ? [] : [{ bearerAuth: [] }],
    parameters: [...(item.pathParams ?? []).map(name => parameter(name, 'path')), ...(item.query ?? []).map(name => parameter(name))],
    requestBody: item.body,
    responses: { [status]: successResponse(status), ...errorResponses },
  };
}

const string = (options = {}) => ({ type: 'string', ...options });
const object = (properties, required = []) => ({ type: 'object', additionalProperties: false, properties, ...(required.length ? { required } : {}) });
const schemas = {
  SuccessResponse: object({ success: { type: 'boolean', const: true }, data: {}, meta: { type: 'object', additionalProperties: true } }, ['success', 'data']),
  ErrorResponse: object({ success: { type: 'boolean', const: false }, error: object({ code: string(), message: string(), details: {} }, ['code', 'message']) }, ['success', 'error']),
  RegisterRequest: object({ email: string({ format: 'email', maxLength: 320 }), password: string({ minLength: 12, maxLength: 128 }), firstName: string({ minLength: 1, maxLength: 100 }), lastName: string({ minLength: 1, maxLength: 100 }), phone: string({ minLength: 7, maxLength: 32 }), role: { type: 'string', enum: ['BUYER', 'FARMER', 'TRANSPORTER'] }, farmName: string({ minLength: 2, maxLength: 180 }), businessName: string({ minLength: 2, maxLength: 180 }) }, ['email', 'password', 'firstName', 'lastName', 'role']),
  LoginRequest: object({ email: string({ format: 'email' }), password: string() }, ['email', 'password']),
  RefreshTokenRequest: object({ refreshToken: string() }, ['refreshToken']),
  TokenRequest: object({ token: string({ minLength: 64, maxLength: 64 }) }, ['token']),
  EmailRequest: object({ email: string({ format: 'email' }) }, ['email']),
  ResetPasswordRequest: object({ token: string({ minLength: 64, maxLength: 64 }), password: string({ minLength: 12, maxLength: 128 }) }, ['token', 'password']),
  ProductRequest: object({ farmerId: string({ format: 'uuid' }), categoryId: string({ format: 'uuid' }), name: string({ minLength: 2, maxLength: 180 }), slug: string(), description: string({ minLength: 10, maxLength: 10000 }), sku: string(), unit: string({ maxLength: 40 }), unitPrice: string({ pattern: '^\\d+(\\.\\d{1,4})?$' }), currency: string({ minLength: 3, maxLength: 3 }), minOrderQuantity: string(), status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'] }, initialQuantity: string(), reorderLevel: string() }, ['categoryId', 'name', 'description', 'unit', 'unitPrice', 'currency']),
  ProductUpdateRequest: object({ categoryId: string({ format: 'uuid' }), name: string({ minLength: 2, maxLength: 180 }), slug: string(), description: string({ minLength: 10, maxLength: 10000 }), sku: string(), unit: string({ maxLength: 40 }), unitPrice: string({ pattern: '^\\d+(\\.\\d{1,4})?$' }), currency: string({ minLength: 3, maxLength: 3 }), minOrderQuantity: string(), status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'] } }),
  CategoryRequest: object({ parentId: { type: ['string', 'null'], format: 'uuid' }, name: string({ minLength: 2, maxLength: 120 }), slug: string(), description: string({ maxLength: 5000 }), isActive: { type: 'boolean' }, sortOrder: { type: 'integer', minimum: 0 } }, ['name']),
  CategoryUpdateRequest: object({ parentId: { type: ['string', 'null'], format: 'uuid' }, name: string({ minLength: 2, maxLength: 120 }), slug: string(), description: string({ maxLength: 5000 }), isActive: { type: 'boolean' }, sortOrder: { type: 'integer', minimum: 0 } }),
  InventorySettingsRequest: object({ reorderLevel: { type: ['string', 'null'] } }, ['reorderLevel']),
  InventoryAdjustmentRequest: object({ type: { type: 'string', enum: ['STOCK_IN', 'RETURN', 'ADJUSTMENT', 'DAMAGE', 'EXPIRY'] }, quantity: string(), reason: string({ maxLength: 255 }) }, ['type', 'quantity']),
  CartItemRequest: object({ productId: string({ format: 'uuid' }), quantity: string(), deliveryMethod: { type: 'string', enum: ['FARMER_DELIVERY', 'BUYER_PICKUP', 'PLATFORM_TRANSPORTER'] } }, ['productId', 'quantity']),
  CartItemUpdateRequest: object({ quantity: string(), deliveryMethod: { type: ['string', 'null'], enum: ['FARMER_DELIVERY', 'BUYER_PICKUP', 'PLATFORM_TRANSPORTER', null] }, savedForLater: { type: 'boolean' } }),
  DeliveryAddress: object({ recipientName: string(), recipientPhone: string(), line1: string(), line2: string(), city: string(), district: string(), region: string(), countryCode: string({ minLength: 2, maxLength: 2 }) }, ['recipientName', 'recipientPhone', 'line1', 'city', 'countryCode']),
  CheckoutGroup: object({ farmerId: string({ format: 'uuid' }), deliveryMethod: { type: 'string', enum: ['FARMER_DELIVERY', 'BUYER_PICKUP', 'PLATFORM_TRANSPORTER'] }, deliveryAddressId: string({ format: 'uuid' }), deliveryAddress: { $ref: '#/components/schemas/DeliveryAddress' }, buyerNotes: string({ maxLength: 2000 }) }, ['farmerId', 'deliveryMethod']),
  CheckoutPreviewRequest: object({ groups: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/CheckoutGroup' } }, couponCode: string({ maxLength: 64 }) }, ['groups']),
  CheckoutRequest: object({ groups: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/CheckoutGroup' } }, couponCode: string({ maxLength: 64 }), paymentProvider: string({ minLength: 2, maxLength: 80 }) }, ['groups', 'paymentProvider']),
  AssignmentRequest: object({ transporterId: string({ format: 'uuid' }), vehicleId: string({ format: 'uuid' }) }, ['transporterId', 'vehicleId']),
  JobAcceptanceRequest: object({ vehicleId: string({ format: 'uuid' }) }),
  JobRejectionRequest: object({ reason: string({ maxLength: 255 }) }),
  DeliveryScheduleRequest: object({ scheduledPickupAt: string({ format: 'date-time' }), vehicleId: string({ format: 'uuid' }) }, ['scheduledPickupAt']),
  DeliveryTransitionRequest: object({ status: { type: 'string', enum: ['PENDING', 'AWAITING_ASSIGNMENT', 'ASSIGNED', 'ACCEPTED', 'REJECTED', 'PICKUP_SCHEDULED', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED'] }, note: string({ maxLength: 255 }), latitude: string(), longitude: string() }, ['status']),
  VehicleRequest: object({ ownerId: string({ format: 'uuid' }), type: { type: 'string', enum: ['BICYCLE', 'MOTORCYCLE', 'TRICYCLE', 'CAR', 'PICKUP_TRUCK', 'VAN', 'REFRIGERATED_VAN', 'TRUCK', 'OTHER'] }, registrationNumber: string(), make: string(), model: string(), color: string(), capacity: string(), capacityUnit: string(), isActive: { type: 'boolean' } }, ['type', 'registrationNumber']),
  VehicleUpdateRequest: object({ type: { type: 'string' }, make: string(), model: string(), color: string(), capacity: string(), capacityUnit: string(), isActive: { type: 'boolean' } }),
  NotificationRequest: object({ recipientId: string({ format: 'uuid' }), type: { type: 'string', enum: ['ACCOUNT', 'ORDER', 'DELIVERY', 'PAYMENT', 'MESSAGE', 'REVIEW', 'SYSTEM'] }, channels: { type: 'array', minItems: 1, uniqueItems: true, items: { type: 'string', enum: ['IN_APP', 'EMAIL'] } }, title: string({ maxLength: 180 }), body: string({ maxLength: 10000 }), data: { type: 'object', additionalProperties: { type: ['string', 'number', 'boolean', 'null'] } } }, ['recipientId', 'type', 'channels', 'title', 'body']),
  NotificationUpdateRequest: object({ status: { type: 'string', enum: ['UNREAD', 'READ', 'ARCHIVED'] } }, ['status']),
  ImageOrderRequest: object({ imageIds: { type: 'array', minItems: 1, maxItems: 8, uniqueItems: true, items: string({ format: 'uuid' }) } }, ['imageIds']),
};
const response = (description) => ({ description, content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } });
const openapi = {
  openapi: '3.1.0',
  info: { title: 'AgriLink REST API', version: '1.0.0', description: 'Versioned REST API for AgriLink. Monetary and quantity values are serialized as decimal strings. All timestamps are UTC ISO 8601 values.' },
  servers: [{ url: 'http://localhost:4000/api/v1', description: 'Local development' }, { url: 'https://api.example.com/api/v1', description: 'Production template' }],
  tags: [...new Set(endpoints.map(item => item.tag))].map(name => ({ name })),
  paths,
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }, schemas,
    responses: { BadRequest: response('Invalid request'), Unauthorized: response('Authentication required'), Forbidden: response('Insufficient role, ownership, or lifecycle permission'), NotFound: response('Resource not found'), Conflict: response('Resource state conflict'), RateLimited: response('Rate limit exceeded'), ServerError: response('Unexpected server error') },
  },
};

const postmanUrl = (path, query = []) => ({
  raw: `{{baseUrl}}${path.replaceAll('{', '{{').replaceAll('}', '}}')}${query.length ? `?${query.map(name => `${name}={{${name}}}`).join('&')}` : ''}`,
  host: ['{{baseUrl}}'], path: path.split('/').filter(Boolean).map(part => part.replaceAll('{', '{{').replaceAll('}', '}}')),
  ...(query.length ? { query: query.map(key => ({ key, value: `{{${key}}}`, disabled: !['page', 'pageSize'].includes(key) })) } : {}),
});
const postmanBody = (body) => {
  if (!body) return undefined;
  const media = body.content['application/json'];
  if (media) return { mode: 'raw', raw: JSON.stringify(media.example ?? {}, null, 2), options: { raw: { language: 'json' } } };
  const schema = body.content['multipart/form-data'].schema;
  return { mode: 'formdata', formdata: Object.entries(schema.properties).map(([key, value]) => ({ key, type: value.format === 'binary' || value.items?.format === 'binary' ? 'file' : 'text', ...(value.format === 'binary' || value.items?.format === 'binary' ? { src: [] } : { value: '' }) })) };
};
const folders = new Map();
for (const item of endpoints) {
  if (!folders.has(item.tag)) folders.set(item.tag, []);
  const headers = item.body?.content['application/json'] ? [{ key: 'Content-Type', value: 'application/json' }] : [];
  folders.get(item.tag).push({
    name: item.summary,
    request: {
      method: item.method.toUpperCase(), headers,
      ...(item.public ? { auth: { type: 'noauth' } } : {}),
      url: postmanUrl(`${apiPrefix}${item.path}`, item.query),
      ...(item.body ? { body: postmanBody(item.body) } : {}),
      description: `${item.roles ? `Allowed roles: ${item.roles.join(', ')}. ` : ''}${item.public ? 'No access token is required.' : 'Requires a bearer access token.'}`,
    },
  });
}
const postman = {
  info: { _postman_id: '8e71ac5c-1d17-4a70-a286-bf953a19aa00', name: 'AgriLink REST API', description: 'Generated from the checked-in AgriLink endpoint inventory. Set baseUrl and accessToken before running protected requests.', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
  auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:4000' }, { key: 'accessToken', value: '' }, { key: 'refreshToken', value: '' },
    ...['id', 'imageId', 'categoryId', 'productId', 'itemId', 'farmerId', 'orderId', 'jobId', 'transporterId', 'vehicleId', 'deliveryId', 'notificationId', 'recipientId', 'verificationToken', 'resetToken'].map(key => ({ key, value: '' })),
    { key: 'page', value: '1' }, { key: 'pageSize', value: '20' }, { key: 'period', value: 'month' },
  ],
  item: [...folders].map(([name, item]) => ({ name, item })),
};

await writeFile(resolve('docs/openapi.yaml'), YAML.stringify(openapi, { lineWidth: 120 }), 'utf8');
await writeFile(resolve('docs/AgriLink.postman_collection.json'), `${JSON.stringify(postman, null, 2)}\n`, 'utf8');
console.log(`Generated OpenAPI and Postman documentation for ${endpoints.length} operations.`);
