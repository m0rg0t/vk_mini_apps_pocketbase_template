import { getHashForParamsFromVK } from 'vk-helpers';
import { detectPlatform } from './platformDetection';

interface AuthenticatedFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  vkId?: number;
  userId?: string;
}

/**
 * Выполняет аутентифицированный запрос с подписью VK для платформы VK
 * Для Telegram платформы выполняет обычный запрос без подписи
 */
export const authenticatedFetch = async (
  url: string, 
  options: AuthenticatedFetchOptions = {}
): Promise<Response> => {
  const platform = detectPlatform();
  const { method = 'GET', headers = {}, body, vkId } = options;

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Добавляем подпись для VK платформы
  if (platform === 'vk' && vkId) {
    try {
      let bodyData: Record<string, unknown> = {};
      
      // Если есть тело запроса, парсим его
      if (body) {
        bodyData = JSON.parse(body);
      }
      
      // Создаем подпись только для vk_id (как на бэке)
      const signParams = {
        vk_id: String(vkId)
      };
      
      const hash = await getHashForParamsFromVK(signParams);
      
      // Для GET запросов добавляем подпись в query параметры
      if (method === 'GET') {
        const urlObj = new URL(url);
        urlObj.searchParams.append('sign', hash.sign);
        urlObj.searchParams.append('ts', String(hash.ts));
        urlObj.searchParams.append('vk_id', String(vkId));
        url = urlObj.toString();
      } else {
        // Для POST/PUT запросов добавляем подпись в тело
        const signedBody = {
          ...bodyData,
          sign: hash.sign,
          ts: hash.ts,
          vk_id: vkId,
        };
        requestOptions.body = JSON.stringify(signedBody);
      }
    } catch (error) {
      console.error('Не удалось создать подпись для VK:', error);
      
      // Добавляем дополнительную информацию для диагностики на мобильных
      console.error('Mobile debugging info:', {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // В production режиме продолжаем без подписи на мобильных устройствах
      const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
      if (process.env.NODE_ENV === 'production' && !isMobile) {
        throw new Error(`VK signature generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // На мобильных или в development режиме продолжаем без подписи
      console.warn('Продолжаем без подписи (mobile device or development mode)');
      if (body) {
        requestOptions.body = body;
      }
    }
  } else {
    // Для Telegram или когда VK ID недоступен
    if (platform === 'vk' && !vkId) {
      console.warn('На VK платформе, но VK ID недоступен - запрос будет отправлен без подписи');
    }
    
    if (body) {
      requestOptions.body = body;
    }
  }

  const response = await fetch(url, requestOptions);
  
  // Специальная обработка ошибок аутентификации
  if (response.status === 400 || response.status === 401 || response.status === 403) {
    try {
      const errorData = await response.json();
      if (errorData.error && (
        errorData.error.includes('Signature') || 
        errorData.error.includes('signature') ||
        errorData.error.includes('authentication') ||
        errorData.error.includes('unauthorized')
      )) {
        throw new Error(`Authentication failed: ${errorData.error}`);
      }
    } catch (parseError) {
      // Если не удалось распарсить ошибку, выбрасываем общую ошибку аутентификации
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }
    }
  }
  
  return response;
};