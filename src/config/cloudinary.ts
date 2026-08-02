import { createHash } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { logger } from './logger';

// Cloudinary reads CLOUDINARY_URL implicitly on first configuration access. Reset
// without that implicit source so stale URL credentials or query parameters cannot
// participate in SDK request signing alongside the explicit Railway variables.
const cloudinaryUrl = process.env.CLOUDINARY_URL;
try {
  delete process.env.CLOUDINARY_URL;
  cloudinary.config(true);
} finally {
  if (cloudinaryUrl !== undefined) process.env.CLOUDINARY_URL = cloudinaryUrl;
}

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const runtimeConfig = cloudinary.config();
if (runtimeConfig.cloud_name !== env.CLOUDINARY_CLOUD_NAME || runtimeConfig.api_key !== env.CLOUDINARY_API_KEY || runtimeConfig.api_secret !== env.CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary runtime configuration does not match the explicit environment credentials.');
}

logger.info({
  cloudinary: {
    authenticationMethod: 'explicit_environment_credentials',
    cloudName: runtimeConfig.cloud_name,
    apiKey: credentialDiagnostic(env.CLOUDINARY_API_KEY),
    apiSecret: credentialDiagnostic(env.CLOUDINARY_API_SECRET),
    apiKeyWhitespaceTrimmed: process.env.CLOUDINARY_API_KEY !== env.CLOUDINARY_API_KEY,
    apiSecretWhitespaceTrimmed: process.env.CLOUDINARY_API_SECRET !== env.CLOUDINARY_API_SECRET,
    cloudinaryUrlPresent: cloudinaryUrl !== undefined,
    cloudinaryUrlIgnored: cloudinaryUrl !== undefined,
    secure: runtimeConfig.secure,
  },
}, 'Cloudinary SDK configured');

function credentialDiagnostic(value: string): { configured: true; length: number; fingerprint: string } {
  return { configured: true, length: value.length, fingerprint: createHash('sha256').update(value).digest('hex').slice(0, 12) };
}

export { cloudinary };
