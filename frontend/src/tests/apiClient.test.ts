import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient } from '../api/client';

const mockFetch = vi.fn();

describe('ApiClient', () => {
  const client = new ApiClient('http://localhost:9999');

  beforeEach(() => {
    // @ts-ignore
    global.fetch = mockFetch;
  });
  afterEach(() => {
    mockFetch.mockReset();
  });

  it('validates request schema and throws 400 on invalid', async () => {
    await expect(client.extract({ message: '' as any })).rejects.toHaveProperty('status', 400);
  });

  it('throws on non-2xx with mapped error', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ code: 'BAD', message: 'no' }), { status: 404 }));
    await expect(client.extract({ message: 'hi' })).rejects.toHaveProperty('status', 404);
  });
});
