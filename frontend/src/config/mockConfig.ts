/**
 * Централизованная конфигурация мок-данных
 *
 * Это единственное место, где контролируется использование мок-данных.
 * Моки НЕ должны использоваться как fallback - только при явном включении.
 */

// Флаг для принудительного включения мок-данных
// ВНИМАНИЕ: Используйте только для разработки и отладки!
export const ENABLE_MOCK_MODE = false;

/**
 * Утилита для проверки, нужно ли использовать моки
 */
export const shouldUseMocks = (): boolean => ENABLE_MOCK_MODE;

/**
 * Wrapper для API вызовов с поддержкой мок-режима
 *
 * @param realApiCall - Функция для вызова реального API
 * @param mockData - Мок-данные для возврата в мок-режиме
 * @param mockDelay - Задержка для имитации сетевого запроса (по умолчанию 500ms)
 */
export const apiCallWithMocks = async <T>(
  realApiCall: () => Promise<T>,
  mockData: T,
  mockDelay: number = 500
): Promise<T> => {
  if (shouldUseMocks()) {

    // Имитируем задержку сети
    await new Promise((resolve) => setTimeout(resolve, mockDelay));

    return mockData;
  }

  // В обычном режиме просто вызываем реальный API
  return realApiCall();
};

/**
 * Хелпер для синхронного получения мок-данных
 * Использовать ТОЛЬКО когда уверены, что нужны именно моки
 */
export const getMockData = <T>(mockData: T): T | null => {
  if (shouldUseMocks()) {
    return mockData;
  }
  return null;
};
