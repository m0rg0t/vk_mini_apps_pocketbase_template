import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import vkBridge, { type UserInfo } from '@vkontakte/vk-bridge';
import WebApp from '@twa-dev/sdk';
import { API_ENDPOINTS } from '../consts';
import type { VKUser, TelegramUser } from '../types';
import { detectPlatform, Platform } from '../utils/platformDetection';
import { getHashForParamsFromVK } from 'vk-helpers';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export interface UniversalUserResponse {
  user: VKUser | null;
  loading: boolean;
  error: string | null;
  platform: Platform;
  createOrUpdateUser: (userData: Partial<VKUser>) => Promise<VKUser | null>;
  refetch: () => Promise<void>;
}

export const useUniversalUser = (): UniversalUserResponse => {
  const queryClient = useQueryClient();
  const platform = detectPlatform();

  const getVKInfo = async (): Promise<UserInfo> => {
    const data = await vkBridge.send('VKWebAppGetUserInfo');
    if (data.id) {
      return data as UserInfo;
    }
    throw new Error('No VK user id found in response');
  };

  const getTelegramInfo = (): TelegramUser | null => {
    return null;

    if (platform !== 'telegram' || !WebApp.initDataUnsafe?.user) {
      return null;
    }
    
    // const tgUser = WebApp.initDataUnsafe.user;
    // return {
    //   id: tgUser.id,
    //   first_name: tgUser.first_name,
    //   last_name: tgUser.last_name,
    //   username: tgUser.username,
    //   language_code: tgUser.language_code,
    //   is_premium: tgUser.is_premium,
    //   photo_url: tgUser.photo_url,
    // };
  };

  // Load platform-specific user info
  const {
    data: platformInfo,
    isLoading: platformLoading,
    error: platformError,
  } = useQuery<UserInfo | TelegramUser | null, Error>({
    queryKey: ['platformUserInfo', platform],
    queryFn: async () => {
      if (platform === 'vk') {
        return await getVKInfo();
      } else if (platform === 'telegram') {
        return getTelegramInfo();
      }
      return null;
    },
    enabled: platform !== 'unknown',
    // staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const fetchUser = async (): Promise<VKUser | null> => {
    if (!platformInfo) {
      return null;
    }

    let userId: string | number;
    let userParams: {
      vk_id?: number;
      telegram_user_id?: number;
      first_name: string;
      last_name: string;
      photo_url?: string;
    } = {
      first_name: '',
      last_name: ''
    };

    if (platform === 'vk' && 'id' in platformInfo) {
      const vkInfo = platformInfo as UserInfo;
      userId = vkInfo.id;
      userParams = {
        vk_id: Number(vkInfo.id),
        first_name: vkInfo.first_name,
        last_name: vkInfo.last_name,
        photo_url: vkInfo.photo_200,
      };
    } else if (platform === 'telegram' && 'id' in platformInfo) {
      const tgInfo = platformInfo as TelegramUser;
      if (!tgInfo.id) {
        throw new Error('Telegram user ID is required');
      }
      userId = tgInfo.id;
      userParams = {
        telegram_user_id: Number(tgInfo.id),
        first_name: tgInfo.first_name || '',
        last_name: tgInfo.last_name || '',
        photo_url: tgInfo.photo_url,
      };
    } else {
      throw new Error('Invalid platform info');
    }

    // Try to get existing user from backend
    const searchParam = platform === 'vk' ? `` : `telegram-id=${userId}`;
    const response = await authenticatedFetch(`${API_ENDPOINTS.BACKEND}/api/vk-users?${searchParam}`, {
      method: 'GET',
      vkId: userId
    });

    let user = null;

    if (response.ok) {
      const users = await response.json();
      user = users.length > 0 ? users[0] : null;
    }

    if (response.status === 404 || !user) {
      // User not found, create new user
      const createResponse = await authenticatedFetch(`${API_ENDPOINTS.BACKEND}/api/vk-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        vkId: userId,
        body: JSON.stringify(userParams),
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create user: ${createResponse.status}`);
      }

      const newUser = await createResponse.json();
      return {
        ...newUser,
        vk_info: platform === 'vk' ? (platformInfo as UserInfo) : undefined,
        telegram_info: platform === 'telegram' ? (platformInfo as TelegramUser) : undefined,
      };
    }

    console.log("USER", JSON.stringify(user), JSON.stringify(userParams));

    // Check if basic info needs to be updated
    if (
      !user ||
      user.first_name !== userParams.first_name ||
      user.last_name !== userParams.last_name ||
      user.photo_url !== userParams.photo_url
    ) {
      const updateResponse = await authenticatedFetch(`${API_ENDPOINTS.BACKEND}/api/vk-users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        vkId: userId,
        body: JSON.stringify({
          first_name: userParams.first_name,
          last_name: userParams.last_name,
          photo_url: userParams.photo_url,
        }),
      });

      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        return {
          ...updatedUser,
          vk_info: platform === 'vk' ? (platformInfo as UserInfo) : undefined,
          telegram_info: platform === 'telegram' ? (platformInfo as TelegramUser) : undefined,
        };
      }
    }

    return {
      ...user,
      vk_info: platform === 'vk' ? (platformInfo as UserInfo) : undefined,
      telegram_info: platform === 'telegram' ? (platformInfo as TelegramUser) : undefined,
    };
  };

  const {
    data: user = null,
    isLoading: userLoading,
    error,
    refetch,
  } = useQuery<VKUser | null, Error>({
    queryKey: ['universalUser', platform, platformInfo],
    queryFn: fetchUser,
    // enabled: !!platformInfo && platform !== 'unknown',
    // staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const createOrUpdateUserMutation = useMutation<VKUser | null, Error, Partial<VKUser>>({
    mutationFn: async (userData: Partial<VKUser>): Promise<VKUser | null> => {
      if (!platformInfo) return null;

      const data: Record<string, unknown> = { ...userData };

      // Add platform-specific security for VK
      if (platform === 'vk' && 'id' in platformInfo) {
        const vkInfo = platformInfo as UserInfo;
        const params = { vk_id: String(vkInfo.id) };
        const hash = await getHashForParamsFromVK(params);
        data.sign = hash.sign;
        data.ts = hash.ts;
      }

      try {
        let result;
        if (user?.id) {
          // Update existing user
          const response = await authenticatedFetch(`${API_ENDPOINTS.BACKEND}/api/vk-users/${user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            vkId: (platformInfo as UserInfo).id,
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(`Failed to update user: ${response.status}`);
          }

          result = await response.json();
        } else {
          // Create new user
          if (platform === 'vk' && 'id' in platformInfo) {
            const vkInfo = platformInfo as UserInfo;
            data.vk_id = vkInfo.id;
          } else if (platform === 'telegram' && 'id' in platformInfo) {
            const tgInfo = platformInfo as TelegramUser;
            data.telegram_user_id = tgInfo.id;
          }

          const response = await authenticatedFetch(`${API_ENDPOINTS.BACKEND}/api/vk-users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            vkId: platform === 'vk' ? (platformInfo as UserInfo).id : undefined,
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(`Failed to create user: ${response.status}`);
          }

          result = await response.json();
        }

        const updatedUser: VKUser = {
          ...result,
          books_read: result.books_read || 0,
          current_streak: result.current_streak || 0,
          year_goal: result.year_goal || 50,
          vk_info: platform === 'vk' ? (platformInfo as UserInfo) : undefined,
          telegram_info: platform === 'telegram' ? (platformInfo as TelegramUser) : undefined,
        };

        return updatedUser;
      } catch (error) {
        console.error('Error creating/updating user:', error);
        throw error;
      }
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        queryClient.setQueryData(['universalUser', platform, platformInfo], updatedUser);
      }
    },
    onError: (error) => {
      console.error('Error creating/updating user:', error);
    },
  });

  const createOrUpdateUser = async (userData: Partial<VKUser>): Promise<VKUser | null> => {
    try {
      const result = await createOrUpdateUserMutation.mutateAsync(userData);
      return result;
    } catch (err) {
      console.error('Error creating/updating user:', err);
      return null;
    }
  };

  const handleRefetch = async () => {
    await refetch();
  };

  const loading = platformLoading || userLoading;
  const errorMessage = platformError?.message || error?.message || null;

  return {
    user,
    loading,
    error: errorMessage,
    platform,
    createOrUpdateUser,
    refetch: handleRefetch,
  };
};