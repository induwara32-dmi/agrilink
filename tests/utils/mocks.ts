import { vi } from 'vitest';
export const cloudinaryMock = { upload: vi.fn(), destroy: vi.fn() };
export const smtpMock = { sendMail: vi.fn().mockResolvedValue({ messageId: 'test-message' }) };
export const eventPublisherMock = { publish: vi.fn().mockResolvedValue(undefined) };
