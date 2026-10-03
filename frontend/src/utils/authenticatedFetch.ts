import { getHashForParamsFromVK } from 'vk-helpers';
import { detectPlatform } from './platformDetection';

interface AuthenticatedFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  vkId?: number;
  userId?: string;
}

/** VK requests fail closed. Telegram keeps its existing separate request contract. */
export const authenticatedFetch = async (
  url: string,
  options: AuthenticatedFetchOptions = {}
): Promise<Response> => {
  const platform = detectPlatform();
  const { headers = {}, body, vkId } = options;
  const method = (options.method ?? 'GET').toUpperCase();
  const requestOptions: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };

  if (platform === 'vk') {
    if (!Number.isSafeInteger(vkId) || !vkId || vkId <= 0) {
      throw new Error('VK identity is required');
    }
    let bodyData: Record<string, unknown> = {};
    if (body) {
      const parsed: unknown = JSON.parse(body);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('VK request body must be a JSON object');
      }
      bodyData = parsed as Record<string, unknown>;
    }
    // Do not downgrade to unsigned requests on mobile, development, or Bridge failure.
    const hash = await getHashForParamsFromVK({ vk_id: String(vkId) });
    if (!hash || typeof hash.sign !== 'string' || !hash.sign || !Number.isFinite(Number(hash.ts)) || Number(hash.ts) <= 0) {
      throw new Error('VK signature generation failed');
    }
    if (method === 'GET' || method === 'HEAD') {
      const signedUrl = new URL(url, window.location.href);
      signedUrl.searchParams.set('sign', hash.sign);
      signedUrl.searchParams.set('ts', String(hash.ts));
      signedUrl.searchParams.set('vk_id', String(vkId));
      url = signedUrl.toString();
    } else {
      requestOptions.body = JSON.stringify({ ...bodyData, sign: hash.sign, ts: hash.ts, vk_id: vkId });
    }
  } else if (platform === 'telegram') {
    if (body) requestOptions.body = body;
  } else {
    throw new Error('Unsupported authentication platform');
  }

  const response = await fetch(url, requestOptions);
  if ([400, 401, 403].includes(response.status)) {
    let message: unknown;
    try {
      const data: unknown = await response.clone().json();
      if (data && typeof data === 'object' && 'error' in data) message = data.error;
    } catch { /* Preserve the original body for callers, including non-JSON errors. */ }
    if (response.status === 401 || response.status === 403 ||
        (typeof message === 'string' && /signature|authentication|unauthorized/i.test(message))) {
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
    }
  }
  return response;
};
