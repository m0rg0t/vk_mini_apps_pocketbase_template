import { CHECK_SIGNATURES, VK_APP_ID, VK_SECRET_KEY } from '../config.js';

let checkRequestSignature;

// Lazy loading vk-helpers to avoid import issues
async function getSignatureChecker() {
  if (!checkRequestSignature) {
    ({ checkRequestSignature } = await import('vk-helpers'));
  }
  return checkRequestSignature;
}

// Extract signature data from request (body or query)
function extractSignatureData(req) {
  const bodyData = req.body || {};
  const queryData = req.query || {};
  
  // Приоритет: body для POST/PUT запросов, query для GET запросов
  const isGetRequest = req.method === 'GET';
  
  return {
    vk_id: isGetRequest ? (queryData.vk_id || bodyData.vk_id) : (bodyData.vk_id || queryData.vk_id),
    sign: isGetRequest ? (queryData.sign || bodyData.sign) : (bodyData.sign || queryData.sign),
    ts: isGetRequest ? (queryData.ts || bodyData.ts) : (bodyData.ts || queryData.ts)
  };
}

// Create verification parameters object
function createVerificationParams(vk_id, sign, ts) {
  return {
    signature: sign,
    secretKey: VK_SECRET_KEY,
    app_id: VK_APP_ID,
    user_id: String(vk_id),
    params: {
      vk_id: String(vk_id),
    },
    ts
  };
}

// Debug logging helper
function logDebugInfo() {
  // Do not log app secrets, user identity, timestamps or signatures.
  console.warn('VK signature checks are explicitly disabled');
}

// Main verification function
async function performSignatureVerification(vk_id, sign, ts) {
  const checker = await getSignatureChecker();
  const params = createVerificationParams(vk_id, sign, ts);
  return checker(params);
}

export async function verifyVkSignature(req, res, next) {
  const { vk_id, sign, ts } = extractSignatureData(req);

  // Debug mode - always proceed but log verification result
  if (!CHECK_SIGNATURES) {
    let isValid = null;
    let error = null;

    if (vk_id && sign && ts) {
      try {
        isValid = await performSignatureVerification(vk_id, sign, ts);
      } catch (e) {
        error = e.message;
      }
    }

    logDebugInfo(vk_id, sign, ts, isValid, error);
    return next();
  }

  if (!VK_APP_ID || !VK_SECRET_KEY) {
    return res.status(503).json({ error: 'VK authentication is not configured' });
  }

  // Production mode - enforce signature verification
  if (!vk_id || !sign || !ts) {
    return res.status(400).json({ error: 'Signature data missing' });
  }

  try {
    const isValid = await performSignatureVerification(vk_id, sign, ts);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Signature is not correct' });
    }
    
    return next();
  } catch (e) {
    console.error('Signature verification failed:', e);
    return res.status(400).json({ error: 'Signature verification failed' });
  }
}

// Middleware to verify that vk_id from signature matches user's vk_id in database
export async function verifyUserAccess(req, res, next) {
  const { vk_id } = extractSignatureData(req);
  
  if (!vk_id) {
    return next(); // Skip check if no vk_id (will be handled by signature verification)
  }

  try {
    const { POCKETBASE_URL } = await import('../config.js');
    const pbFetch = (await import('./pbFetch.js')).default;
    
    const userResponse = await pbFetch(`${POCKETBASE_URL}/api/collections/vk_users/records/${req.params.userId}`);
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      if (userData.vk_id && String(userData.vk_id) !== String(vk_id)) {
        return res.status(403).json({ error: "Access denied: user ID mismatch" });
      }
    }
    
    return next();
  } catch (e) {
    console.error('User access verification failed:', e);
    return res.status(500).json({ error: 'Failed to verify user access' });
  }
}
