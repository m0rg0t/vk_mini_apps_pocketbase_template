import vkBridge, { parseURLSearchParamsForGetLaunchParams } from '@vkontakte/vk-bridge';
import { useAdaptivity, useAppearance, useInsets } from '@vkontakte/vk-bridge-react';
import { AdaptivityProvider, ConfigProvider, AppRoot } from '@vkontakte/vkui';
import { RouterProvider } from '@vkontakte/vk-mini-apps-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import '@vkontakte/vkui/dist/vkui.css';

import { transformVKBridgeAdaptivity } from './utils';
import { router } from './routes';
import { App } from './App';
import { useVKBannerAds } from './hooks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Оптимизация для Android WebView
      staleTime: 0, // 1000 * 60 * 5, // 5 минут - разумное время кэширования
      structuralSharing: false,
      gcTime: 1000 * 60 * 30,   // 30 минут сборки мусора (было cacheTime в v4)
      retry: (failureCount, error) => {
        // Кастомная логика повтора для мобильных сетевых проблем
        const errorMessage = error?.message?.toLowerCase() || '';
        const isNetworkError = errorMessage.includes('networkerror') || 
                              errorMessage.includes('fetch') ||
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('connection');
        
        if (isNetworkError) {
          return failureCount < 3; // Больше попыток для сетевых ошибок
        }
        return failureCount < 1; // Меньше попыток для других ошибок
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Экспоненциальная задержка до 10 сек
      refetchOnWindowFocus: false, // Отключено для мини-приложений
      refetchOnReconnect: true,    // Важно для переключения между WiFi/мобильным интернетом
      refetchOnMount: 'always',    // Всегда перезапрашивать при монтировании компонента
    },
    mutations: {
      retry: 2, // Повторить мутации до 2 раз
      retryDelay: 1000,
    },
  },
});

export const AppConfig = () => {
  const vkBridgeAppearance = useAppearance() || undefined;
  const vkBridgeInsets = useInsets() || undefined;
  const adaptivity = transformVKBridgeAdaptivity(useAdaptivity());
  const { vk_platform } = parseURLSearchParamsForGetLaunchParams(window.location.search);
  const { showBottomBannerAd } = useVKBannerAds();

  // Применяем тему к документу
  useEffect(() => {
    if (vkBridgeAppearance) {
      document.documentElement.setAttribute('data-appearance', vkBridgeAppearance);
    }
  }, [vkBridgeAppearance]);

  // Показываем баннерную рекламу внизу при запуске приложения
  useEffect(() => {
    showBottomBannerAd();
  }, [showBottomBannerAd]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        colorScheme={vkBridgeAppearance}
        platform={vk_platform === 'desktop_web' ? 'vkcom' : undefined}
        isWebView={vkBridge.isWebView()}
        hasCustomPanelHeaderAfter={true}
      >
        <AdaptivityProvider {...adaptivity}>
          <AppRoot mode="full" safeAreaInsets={vkBridgeInsets}>
            <RouterProvider router={router}>
              <App />
            </RouterProvider>
          </AppRoot>
        </AdaptivityProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
};
