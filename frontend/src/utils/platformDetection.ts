import WebApp from '@twa-dev/sdk';

export type Platform = 'vk' | 'telegram' | 'unknown';

export const detectPlatform = (): Platform => {
  return 'vk';

  // Check if we're in VK environment
  if (window.location.search.includes('vk_') || window.location.hash.includes('vk_')) {
    return 'vk';
  }

  // Default fallback - check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('vk_user_id') || urlParams.has('vk_app_id')) {
    return 'vk';
  }

  // For development/testing, you might want to check localStorage or other indicators
  const platform = localStorage.getItem('debug_platform') as Platform;
  if (platform === 'vk' || platform === 'telegram') {
    return platform;
  }

  // Check user agent for additional clues
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('telegram')) {
    return 'telegram';
  }

  if (userAgent.includes('vk') || userAgent.includes('vkontakte')) {
    return 'vk';
  }

  // Check if we're in Telegram Web App
  if (WebApp.initData && WebApp.initDataUnsafe) {
    return 'telegram';
  }

  return 'unknown';
};

export const isPlatform = (platform: Platform): boolean => {
  return detectPlatform() === platform;
};

export const isVK = (): boolean => isPlatform('vk');
export const isTelegram = (): boolean => isPlatform('telegram');