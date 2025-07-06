import { useCallback, useState } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { useUserBadges } from './useUserBadges';
import { useUniversalUser } from './useUniversalUser';
import { authenticatedFetch } from '../utils/authenticatedFetch';

interface InviteFriendResult {
  success: boolean;
  badgeAwarded?: boolean;
  message?: string;
  error?: string;
}

interface UseInviteFriendReturn {
  inviteFriend: () => Promise<InviteFriendResult>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook для приглашения друзей и получения бейджа
 */
export function useInviteFriend(userId?: string): UseInviteFriendReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetchUserBadges } = useUserBadges();
  const { user, platform } = useUniversalUser();
  const vkId = platform === 'vk' && user?.vk_info ? user.vk_info.id : undefined;

  const inviteFriend = useCallback(async (): Promise<InviteFriendResult> => {
    if (!userId) {
      const errorMsg = 'User ID is required for inviting friends';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Формируем ссылку на приложение
      const appUrl = `https://vk.com/app${
        import.meta.env.VITE_VK_APP_ID || "53603553"
      }#/`;

      console.log("Sharing app URL:", appUrl);

      // Отправляем через VK Bridge
      const shareResult = await vkBridge.send("VKWebAppShare", {
        link: appUrl,
      });

      if (shareResult && shareResult.length > 0) {
        console.log("Приложение успешно расшарено");
        
        // Пытаемся выдать бейдж за приглашение друга
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
          const badgeResponse = await authenticatedFetch(`${backendUrl}/api/users/${userId}/award-referral-badge`, {
            method: 'POST',
            vkId,
            userId,
          });
          
          if (badgeResponse.ok) {
            const badgeData = await badgeResponse.json();
            
            if (badgeData.badgeAwarded) {
              console.log("Бейдж за приглашение друга успешно выдан!");
              // Обновляем список бейджей пользователя
              refetchUserBadges();
              
              return {
                success: true,
                badgeAwarded: true,
                message: badgeData.message || "Поздравляем! Вы получили бейдж за приглашение друга!"
              };
            } else {
              console.log("Бейдж уже был выдан ранее");
              return {
                success: true,
                badgeAwarded: false,
                message: badgeData.message || "Приглашение отправлено успешно"
              };
            }
          } else {
            console.error("Ошибка при выдаче бейджа:", badgeResponse.status);
            // Не считаем это критической ошибкой - шаринг прошел успешно
            return {
              success: true,
              badgeAwarded: false,
              message: "Приглашение отправлено, но произошла ошибка при выдаче бейджа"
            };
          }
        } catch (badgeError) {
          console.error("Ошибка при выдаче бейджа за приглашение:", badgeError);
          // Не считаем это критической ошибкой - шаринг прошел успешно
          return {
            success: true,
            badgeAwarded: false,
            message: "Приглашение отправлено успешно"
          };
        }
      } else {
        const errorMsg = "Не удалось отправить приглашение";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (shareError) {
      console.error("Ошибка при попытке поделиться приложением:", shareError);
      const errorMsg = shareError instanceof Error 
        ? shareError.message 
        : "Произошла ошибка при отправке приглашения";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [userId, vkId, refetchUserBadges]);

  return {
    inviteFriend,
    isLoading,
    error,
  };
}