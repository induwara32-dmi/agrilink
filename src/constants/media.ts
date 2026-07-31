export const MEDIA_LIMITS = Object.freeze({
  product: { maxFilesPerRequest: 5, maxFilesPerProduct: 8, maxBytes: 5 * 1024 * 1024 },
  profile: { maxBytes: 3 * 1024 * 1024 },
  proof: { maxBytes: 8 * 1024 * 1024 },
});

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
