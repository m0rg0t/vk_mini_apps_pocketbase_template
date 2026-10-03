import { jest } from '@jest/globals';
let settings;
const checker = jest.fn();
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  settings = { CHECK_SIGNATURES: true, VK_APP_ID: '42', VK_SECRET_KEY: 'synthetic-secret' };
  jest.unstable_mockModule('../config.js', () => settings);
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
  const { response, next } = await verify({ vk_id: 123, sign: 'fake', ts: 1 });
  expect(response.status).toHaveBeenCalledWith(503);
  expect(next).not.toHaveBeenCalled();
  expect(checker).not.toHaveBeenCalled();
});
it('rejects missing signature', async () => {
  const { response, next } = await verify({ vk_id: 123 });
  expect(response.status).toHaveBeenCalledWith(400);
  expect(next).not.toHaveBeenCalled();
});
it('rejects failed verification and accepts valid verification', async () => {
  checker.mockReturnValueOnce(false).mockReturnValueOnce(true);
  const invalid = await verify({ vk_id: 123, sign: 'fake', ts: 1 });
  expect(invalid.response.status).toHaveBeenCalledWith(400);
  const valid = await verify({ vk_id: 123, sign: 'synthetic', ts: 1 });
  expect(valid.next).toHaveBeenCalledTimes(1);
});
it('debug mode never logs secret or signed user data', async () => {
  settings.CHECK_SIGNATURES = false;
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const { next } = await verify({ vk_id: 123, sign: 'private-signature', ts: 1 });
  expect(next).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(warning.mock.calls)).not.toMatch(/synthetic-secret|private-signature|123/);
  warning.mockRestore();
});
