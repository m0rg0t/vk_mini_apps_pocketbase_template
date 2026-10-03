import { jest } from '@jest/globals';
let settings;
const checker = jest.fn();
const pbFetch = jest.fn();
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  checker.mockReset();
  pbFetch.mockReset();
  settings = { CHECK_SIGNATURES: true, VK_APP_ID: '42', VK_SECRET_KEY: 'synthetic-secret' };
  jest.unstable_mockModule('../config.js', () => settings);
  jest.unstable_mockModule('../utils/pbFetch.js', () => ({ default: pbFetch }));
  settings.POCKETBASE_URL = 'http://127.0.0.1:8080';
  jest.unstable_mockModule('vk-helpers', () => ({ checkRequestSignature: checker }));
});
async function verify(body = {}) {
  const { verifyVkSignature } = await import('../utils/signature.js');
  const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  await verifyVkSignature({ method: 'POST', body }, response, next);
  return { response, next };
}
it('rejects unconfigured verification rather than signing with an empty key', async () => {
  settings.VK_SECRET_KEY = '';
  const { response, next } = await verify({ vk_id: 123, sign: 'fake', ts: Math.floor(Date.now() / 1000) });
  expect(response.status).toHaveBeenCalledWith(503);
  expect(next).not.toHaveBeenCalled();
  expect(checker).not.toHaveBeenCalled();
});
it('rejects missing signature', async () => {
  const { response, next } = await verify({ vk_id: 123 });
  expect(response.status).toHaveBeenCalledWith(401);
  expect(next).not.toHaveBeenCalled();
});
it('rejects failed verification and accepts valid verification', async () => {
  checker.mockReturnValueOnce(false).mockReturnValueOnce(true);
  const invalid = await verify({ vk_id: 123, sign: 'fake', ts: Math.floor(Date.now() / 1000) });
  expect(invalid.response.status).toHaveBeenCalledWith(401);
  const valid = await verify({ vk_id: 123, sign: 'synthetic', ts: Math.floor(Date.now() / 1000) });
  expect(valid.next).toHaveBeenCalledTimes(1);
});
it('debug mode never logs secret or signed user data', async () => {
  settings.CHECK_SIGNATURES = false;
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const { next } = await verify({ vk_id: 123, sign: 'private-signature', ts: Math.floor(Date.now() / 1000) });
  expect(next).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(warning.mock.calls)).not.toMatch(/synthetic-secret|private-signature|123/);
  warning.mockRestore();
});

it.each([
  ['missing owner identity', { ok: true, json: async () => ({}) }, 403],
  ['different owner', { ok: true, json: async () => ({ vk_id: 456 }) }, 403],
  ['not found', { ok: false, status: 404 }, 403],
  ['unavailable', { ok: false, status: 500 }, 503],
])('denies %s', async (name, lookup, status) => {
  const { verifyUserAccess } = await import('../utils/signature.js');
  pbFetch.mockResolvedValueOnce(lookup);
  const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  await verifyUserAccess({ params: { userId: 'user1' }, authIdentity: { platform: 'vk', id: '123' } }, response, next);
  expect(response.status).toHaveBeenCalledWith(status);
  expect(next).not.toHaveBeenCalled();
});
it('allows verified owner and denies unavailable lookups', async () => {
  const { verifyUserAccess } = await import('../utils/signature.js');
  const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  const req = { params: { userId: 'user1' }, authIdentity: { platform: 'vk', id: '123' } };
  pbFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ vk_id: 123 }) });
  await verifyUserAccess(req, response, next);
  expect(next).toHaveBeenCalledTimes(1);
  next.mockClear(); pbFetch.mockRejectedValueOnce(new Error('synthetic outage'));
  await verifyUserAccess(req, response, next);
  expect(response.status).toHaveBeenCalledWith(503);
  expect(next).not.toHaveBeenCalled();
});
it('rejects unverified Telegram before persistence', async () => {
  const { response, next } = await verify({ telegram_user_id: 123 });
  expect(response.status).toHaveBeenCalledWith(501);
  expect(next).not.toHaveBeenCalled();
  expect(pbFetch).not.toHaveBeenCalled();
});
