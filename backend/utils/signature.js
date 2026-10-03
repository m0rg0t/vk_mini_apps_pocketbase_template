import { CHECK_SIGNATURES, VK_APP_ID, VK_SECRET_KEY, POCKETBASE_URL } from '../config.js';
import pbFetch from './pbFetch.js';

let checkRequestSignature;
async function getSignatureChecker() {
  if (!checkRequestSignature) ({ checkRequestSignature } = await import('vk-helpers'));
  return checkRequestSignature;
}

function extractSignatureData(req) {
  const data = req.method === 'GET' || req.method === 'HEAD' ? req.query || {} : req.body || {};
  return { vk_id: data.vk_id, sign: data.sign, ts: data.ts };
}

export async function verifyVkSignature(req, res, next) {
  // The config permits this only with explicit test/development + CHECK_SIGNATURES=false.
  if (!CHECK_SIGNATURES) {
    console.warn('VK signature checks are explicitly disabled');
    req.authIdentity = { platform: 'development' };
    return next();
  }
  // Telegram requires its own server-verified initData identity. Never treat an ID as proof.
  if (req.query?.['telegram-id'] || req.body?.telegram_user_id) {
    return res.status(501).json({ error: 'Verified Telegram authentication is not implemented' });
  }
  if (!VK_APP_ID || !VK_SECRET_KEY) {
    return res.status(503).json({ error: 'VK authentication is not configured' });
  }
  const { vk_id, sign, ts } = extractSignatureData(req);
  const id = String(vk_id ?? '');
  const timestamp = Number(ts);
  const now = Math.floor(Date.now() / 1000);
  if (!/^[1-9]\d*$/.test(id) || typeof sign !== 'string' || !sign ||
      !/^\d+$/.test(String(ts ?? '')) || !Number.isSafeInteger(timestamp) || timestamp < now - 300 || timestamp > now + 30) {
    return res.status(401).json({ error: 'Signature data missing or expired' });
  }
  try {
    const checker = await getSignatureChecker();
    if (!checker({ signature: sign, secretKey: VK_SECRET_KEY, app_id: VK_APP_ID,
      user_id: id, params: { vk_id: id }, ts })) {
      return res.status(401).json({ error: 'Signature is not correct' });
    }
    if (req.params?.vkId && String(req.params.vkId) !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.authIdentity = { platform: 'vk', id };
    return next();
  } catch {
    return res.status(401).json({ error: 'Signature verification failed' });
  }
}

export async function verifyUserAccess(req, res, next) {
  if (!CHECK_SIGNATURES && req.authIdentity?.platform === 'development') return next();
  if (req.authIdentity?.platform !== 'vk') return res.status(401).json({ error: 'Authentication required' });
  const userId = req.params.userId || req.params.id;
  if (!userId || !/^[a-zA-Z0-9_-]+$/.test(userId)) return res.status(400).json({ error: 'Invalid user ID' });
  try {
    const response = await pbFetch(`${POCKETBASE_URL}/api/collections/vk_users/records/${encodeURIComponent(userId)}`);
    if (!response.ok) return res.status(response.status === 404 ? 403 : 503).json({ error: 'Unable to verify ownership' });
    const user = await response.json();
    if (!user.vk_id || String(user.vk_id) !== req.authIdentity.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    return next();
  } catch {
    return res.status(503).json({ error: 'Unable to verify ownership' });
  }
}

export async function verifyUserBookAccess(req, res, next) {
  if (!CHECK_SIGNATURES && req.authIdentity?.platform === 'development') return next();
  try {
    const response = await pbFetch(`${POCKETBASE_URL}/api/collections/vk_user_books/records/${encodeURIComponent(req.params.userBookId)}`);
    if (!response.ok) return res.status(response.status === 404 ? 403 : 503).json({ error: 'Unable to verify book ownership' });
    const book = await response.json();
    if (!book.user || book.user !== req.params.userId) return res.status(403).json({ error: 'Access denied' });
    return next();
  } catch {
    return res.status(503).json({ error: 'Unable to verify book ownership' });
  }
}
