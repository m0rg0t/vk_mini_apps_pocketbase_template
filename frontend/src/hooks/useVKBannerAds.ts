import { useCallback } from 'react';
import vkBridge, { BannerAdLocation, BannerAdLayoutType } from '@vkontakte/vk-bridge';

interface VKBannerAdOptions {
  banner_location?: BannerAdLocation;
  layout_type?: BannerAdLayoutType;
}

export const useVKBannerAds = () => {
  const showBannerAd = useCallback(async (options: VKBannerAdOptions = {}) => {
    try {
      const result = await vkBridge.send('VKWebAppShowBannerAd', {
        banner_location: options.banner_location || ('bottom' as BannerAdLocation),
        layout_type: options.layout_type || ('resize' as BannerAdLayoutType),
        ...options
      });
      console.log('Banner ad shown successfully:', result);
      return result;
    } catch (error) {
      console.log('Banner ad failed to show:', error);
      return null;
    }
  }, []);

  const hideBannerAd = useCallback(async () => {
    try {
      const result = await vkBridge.send('VKWebAppHideBannerAd');
      console.log('Banner ad hidden successfully:', result);
      return result;
    } catch (error) {
      console.log('Banner ad failed to hide:', error);
      return null;
    }
  }, []);

  const showBottomBannerAd = useCallback(() => {
    return showBannerAd({
      banner_location: 'bottom' as BannerAdLocation,
      layout_type: 'resize' as BannerAdLayoutType
    });
  }, [showBannerAd]);

  return {
    showBannerAd,
    hideBannerAd,
    showBottomBannerAd
  };
};