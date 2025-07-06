// Mock data for Universal Mini App Template development

// Mock user data for local development
export const MOCK_VK_USER = {
  id: '1',
  vk_id: 123456789,
  first_name: 'Тест',
  last_name: 'Пользователь',
  photo_url: 'https://sun9-74.userapi.com/sun9-74/s/v1/ig2/test_avatar.jpg',
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-01-01T00:00:00.000Z',
};

// Mock user data examples
export const MOCK_USER_DATA = [
  {
    id: '1',
    user: '1',
    data_type: 'preferences',
    data_key: 'theme',
    data_value: { theme: 'dark', language: 'ru' },
    created: '2024-01-01T00:00:00.000Z',
    updated: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    user: '1',
    data_type: 'settings',
    data_key: 'notifications',
    data_value: { enabled: true, email: false, push: true },
    created: '2024-01-01T00:00:00.000Z',
    updated: '2024-01-01T00:00:00.000Z',
  }
];

// Mock badges data (example achievements)
export const MOCK_BADGES = [
  {
    id: '1',
    name: 'Первые шаги',
    description: 'Добро пожаловать в приложение!',
    image: '/Badges-01.png',
    criteria: 'Зарегистрироваться в приложении',
    is_active: true,
    sort_order: 1,
    created: '2024-01-01T00:00:00.000Z',
    updated: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Активный пользователь',
    description: 'Используйте приложение 7 дней подряд',
    image: '/Badges-02.png',
    criteria: 'Войти в приложение 7 дней подряд',
    is_active: true,
    sort_order: 2,
    created: '2024-01-01T00:00:00.000Z',
    updated: '2024-01-01T00:00:00.000Z',
  }
];

// Utility for delays (simulating network requests)
export const mockDelay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));
