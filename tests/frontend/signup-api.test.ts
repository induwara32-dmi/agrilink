import { afterEach, describe, expect, it, vi } from 'vitest';
import { register, verifyEmail, type RegistrationInput } from '../../lib/api/auth';

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'signup@example.com',
  phone: null,
  role: 'BUYER' as const,
  status: 'PENDING_VERIFICATION',
  emailVerifiedAt: null,
  profile: { firstName: 'Test', lastName: 'User', displayName: null, avatarUrl: null },
};

function successfulResponse(data: unknown): Response {
  return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

describe('frontend registration API', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each<RegistrationInput>([
    { firstName: 'Buyer', lastName: 'User', email: 'buyer@example.com', password: 'StrongPassword!1', role: 'BUYER' },
    { firstName: 'Farmer', lastName: 'User', email: 'farmer@example.com', password: 'StrongPassword!1', role: 'FARMER', farmName: 'Green Farm' },
    { firstName: 'Transporter', lastName: 'User', email: 'transporter@example.com', password: 'StrongPassword!1', role: 'TRANSPORTER', businessName: 'Farm Logistics' },
  ])('submits $role through the centralized register endpoint', async (input) => {
    const fetchMock = vi.fn().mockResolvedValue(successfulResponse({ user: { ...user, email: input.email, role: input.role }, message: 'Check your email.' }));
    vi.stubGlobal('fetch', fetchMock);

    await register(input);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('http://localhost:4000/api/v1/auth/register');
    expect(options.method).toBe('POST');
    expect(JSON.parse(String(options.body))).toEqual(input);
  });

  it('submits the emailed verification token before showing verified state', async () => {
    const token = 'a'.repeat(64);
    const fetchMock = vi.fn().mockResolvedValue(successfulResponse({ user: { ...user, status: 'ACTIVE', emailVerifiedAt: new Date().toISOString() } }));
    vi.stubGlobal('fetch', fetchMock);

    await verifyEmail(token);

    const [url, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('http://localhost:4000/api/v1/auth/verify-email');
    expect(JSON.parse(String(options.body))).toEqual({ token });
  });
});
