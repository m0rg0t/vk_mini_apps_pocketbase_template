import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { getHashForParamsFromVK } from 'vk-helpers';
import { detectPlatform } from './platformDetection';
import { authenticatedFetch } from './authenticatedFetch';
vi.mock('vk-helpers', () => ({ getHashForParamsFromVK: vi.fn() }));
vi.mock('./platformDetection', () => ({ detectPlatform: vi.fn() }));
const signing = vi.mocked(getHashForParamsFromVK);
const platform = vi.mocked(detectPlatform);
const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  platform.mockReturnValue('vk');
  signing.mockResolvedValue({ sign: 'synthetic-signature', ts: 1234567890 });
  fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
});
afterEach(() => vi.unstubAllGlobals());
describe('VK request signing', () => {
  it.each(['desktop', 'Android Mobile', 'iPhone'])('never sends on signing failure (%s)', async userAgent => {
    vi.stubGlobal('navigator', { userAgent });
    signing.mockRejectedValueOnce(new Error('Bridge declined'));
    await expect(authenticatedFetch('/api/test', { vkId: 123 })).rejects.toThrow('Bridge declined');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([undefined, 0, -1, NaN, 1.5])('rejects invalid identity %s', async vkId => {
    await expect(authenticatedFetch('/api/test', { vkId })).rejects.toThrow('identity');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(['broken', 'null', '[]', '123'])('rejects malformed body %s before network', async body => {
    await expect(authenticatedFetch('/api/test', { method: 'POST', vkId: 123, body })).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('replaces stale query credentials and normalizes the method', async () => {
    await authenticatedFetch('https://example.test/api?sign=old&vk_id=999', { method: 'get', vkId: 123 });
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.getAll('sign')).toEqual(['synthetic-signature']);
    expect(url.searchParams.getAll('vk_id')).toEqual(['123']);
    expect(fetchMock.mock.calls[0][1]?.method).toBe('GET');
  });
  it('signs POST while preserving unrelated fields', async () => {
    await authenticatedFetch('/api/test', { method: 'POST', vkId: 123, body: '{"title":"book","vk_id":999}' });
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ title: 'book', vk_id: 123, sign: 'synthetic-signature', ts: 1234567890 });
  });
  it('rejects incomplete Bridge response', async () => {
    signing.mockResolvedValueOnce({ sign: '', ts: 0 });
    await expect(authenticatedFetch('/api/test', { vkId: 123 })).rejects.toThrow('signature');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
describe('response and platform contracts', () => {
  it.each([200, 400, 500])('keeps response body readable (%s)', async status => {
    fetchMock.mockResolvedValueOnce(new Response('{"error":"validation"}', { status }));
    const response = await authenticatedFetch('/api/test', { vkId: 123 });
    expect(response.bodyUsed).toBe(false);
    expect(await response.json()).toEqual({ error: 'validation' });
  });
  it('keeps non-JSON 400 body readable', async () => {
    fetchMock.mockResolvedValueOnce(new Response('not JSON', { status: 400 }));
    expect(await (await authenticatedFetch('/api/test', { vkId: 123 })).text()).toBe('not JSON');
  });
  it.each([400, 401, 403])('throws authentication errors (%s)', async status => {
    fetchMock.mockResolvedValueOnce(new Response('{"error":"Signature is not correct"}', { status }));
    await expect(authenticatedFetch('/api/test', { vkId: 123 })).rejects.toThrow(`Authentication failed: ${status}`);
  });
  it.each([401, 403])('rejects non-JSON auth errors (%s)', async status => {
    fetchMock.mockResolvedValueOnce(new Response('not JSON', { status }));
    await expect(authenticatedFetch('/api/test', { vkId: 123 })).rejects.toThrow('Authentication failed');
  });
  it('preserves separate Telegram body and headers', async () => {
    platform.mockReturnValue('telegram');
    await authenticatedFetch('/api/test', { method: 'POST', body: '{"telegram_id":123}', headers: { Authorization: 'synthetic' } });
    expect(signing).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0]).toEqual(['/api/test', { method: 'POST', body: '{"telegram_id":123}', headers: { 'Content-Type': 'application/json', Authorization: 'synthetic' } }]);
  });
  it('does not invent authentication for unknown platform', async () => {
    platform.mockReturnValue('unknown');
    await expect(authenticatedFetch('/api/test')).rejects.toThrow('Unsupported');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
