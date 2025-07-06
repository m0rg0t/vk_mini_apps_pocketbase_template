/**
 * Готовые мок-данные в правильных форматах для использования в хуках
 *
 * Все трансформации и маппинги мок-данных собраны здесь,
 * чтобы не засорять хуки логикой преобразования.
 */

import { MOCK_VK_USER } from './mockData';
import type { UserInfo } from '@vkontakte/vk-bridge';
import type { VKUser } from '../types';

/**
 * VK UserInfo для VK Bridge
 */
export const READY_MOCK_VK_INFO: UserInfo = {
  id: MOCK_VK_USER.vk_id,
  first_name: MOCK_VK_USER.first_name,
  last_name: MOCK_VK_USER.last_name,
  photo_200: MOCK_VK_USER.photo_url,
} as UserInfo;

/**
 * VK User для useVKUser хука
 */
export const READY_MOCK_VK_USER: VKUser = {
  ...MOCK_VK_USER,
  id: String(MOCK_VK_USER.id),
  vk_id: MOCK_VK_USER.vk_id,
  first_name: MOCK_VK_USER.first_name,
  last_name: MOCK_VK_USER.last_name,
  vk_info: READY_MOCK_VK_INFO,
};

// Мок-данные ежедневной книги удалены - используются реальные данные из API

// Мок-данные пользовательских книг удалены - используются реальные данные из API

// Мок-данные пользовательских бейджей удалены - используются реальные данные из API

// Мок-данные бейджей удалены - используются реальные данные из API

// Мок-данные создания пользовательских книг удалены - используются реальные данные из API
