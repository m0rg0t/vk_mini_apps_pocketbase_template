import type { UserInfo } from '@vkontakte/vk-bridge';

export interface Badge {
  id: string;
  name: string;
  description: string;
  image?: string;
  imageUrl?: string;
  criteria?: string;
  is_active?: boolean;
  sort_order?: number;
  created: string;
  updated: string;
}

export interface TelegramUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface VKUser {
  id: string;
  vk_id?: number;
  telegram_user_id?: number;
  first_name: string;
  last_name: string;
  created: string;
  updated: string;
  vk_info?: UserInfo;
  telegram_info?: TelegramUser;
}

export interface UserData {
  id: string;
  user: string;
  data_type: string;
  data_key: string;
  data_value: any;
  created: string;
  updated: string;
}
