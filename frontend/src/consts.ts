// API endpoints configuration
export const API_ENDPOINTS = {
  POCKETBASE: import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8080',
  BACKEND: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3000',
} as const;


// PocketBase collection names
export const COLLECTIONS = {
  BADGES: 'badges',
  BOOKS: 'books',
  VK_USERS: 'vk_users',
  VK_USER_BADGES: 'vk_user_badges',
  VK_USER_BOOKS: 'vk_user_books',
} as const;

// Book genres
export const BOOK_GENRES = [
  { id: 'all', name: 'Все' },
  { id: 'recommended', name: 'Рекомендуемые' },
] as const;
