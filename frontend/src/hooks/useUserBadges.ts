import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { API_ENDPOINTS } from '../consts';
import { useNotifications } from '../contexts/NotificationContext';
import type { Badge } from '../types';
import { getLastBadgeCheckTimestamp, shouldShowBadgeNotification, updateLastBadgeCheckTimestamp } from '../utils';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { useUniversalUser } from './useUniversalUser';

export interface UserEarnedBadge {
  id: string;
  user: string;
  badge: string;
  earned_at: string;
  created: string;
  updated: string;
  // Expanded badge info if available
  expand?: {
    badge?: Badge;
  };
}

export interface UserBadgesResponse {
  badges: Badge[];
  userBadges: UserEarnedBadge[];
  loading: boolean;
  isFetched: boolean;
  error: string | null;
  awardBadge: (badgeId: string) => Promise<UserEarnedBadge | null>;
  refetchBadges: () => Promise<void>;
  refetchUserBadges: () => Promise<void>;
}

const fetchBadges = async (): Promise<Badge[]> => {
  // Мок-данные удалены - всегда используем реальное API
  const response = await fetch(`${API_ENDPOINTS.BACKEND}/api/badges`);
  if (!response.ok) {
    throw new Error(`Failed to fetch badges: ${response.status}`);
  }
  const data = await response.json();
  return data.items || [];
};

const fetchUserBadges = async (userId: string, vkId?: number): Promise<UserEarnedBadge[]> => {
  // Используем аутентифицированный запрос с подписью для VK
  const response = await fetch(`${API_ENDPOINTS.BACKEND}/api/users/${userId}/badges?vk_id=${vkId ?? ''}`, {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch user badges: ${response.status}`);
  }
  const data = await response.json();
  return data.items || [];
};

const awardBadgeApi = async (userId: string, badgeId: string, vkId?: number): Promise<UserEarnedBadge> => {
  const response = await authenticatedFetch(`${API_ENDPOINTS.BACKEND}/api/users/${userId}/badges`, {
    method: 'POST',
    vkId,
    userId,
    body: JSON.stringify({
      badge_id: badgeId,
    }),
  });

  if (response.status === 409) {
    // User already has this badge
    throw new Error('User already has this badge');
  }

  if (!response.ok) {
    throw new Error(`Failed to award badge: ${response.status}`);
  }

  return response.json();
};

export const useUserBadges = (): UserBadgesResponse => {
  const queryClient = useQueryClient();

  const { user, platform } = useUniversalUser();
  const userId = user?.id;
  const vkId = platform === 'vk' && user?.vk_info ? user.vk_info.id : undefined;

  const { showBadgeNotification } = useNotifications();

  // Debug logging
  console.log('[useUserBadges] Hook state:', {
    hasUser: !!user,
    userId,
    platform,
    vkId,
    userVkInfo: user?.vk_info
  });

  // Fetch all available badges
  const {
    data: badges = [],
    isLoading: badgesLoading,
    isFetched: badgesIsFetched,
    error: badgesError,
    refetch: refetchBadgesQuery,
  } = useQuery<Badge[], Error>({
    queryKey: ['badges'],
    queryFn: fetchBadges,
    // staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
  });

  // Debug logging for badges fetch
  if (badgesIsFetched && !badgesError) {
    console.log('[useUserBadges] Badges fetched successfully:', {
      count: badges?.length,
      badges: badges?.map((b: Badge) => ({ id: b.id, name: b.name }))
    });
  }
  if (badgesError) {
    console.error('[useUserBadges] Error fetching badges:', badgesError);
  }

  // Fetch user's earned badges
  const {
    data: userBadges = [],
    isLoading: userBadgesLoading,
    isFetched: userBadgesIsFetched,
    error: userBadgesError,
    refetch: refetchUserBadgesQuery,
  } = useQuery<UserEarnedBadge[], Error>({
    queryKey: ['userBadges', userId, vkId],
    queryFn: () => {
      console.log('[useUserBadges] Fetching user badges with params:', { userId, vkId });
      if (userId && vkId) {
      return fetchUserBadges(userId, vkId);
      } else {
        console.warn('[useUserBadges] User ID or VK ID is missing, cannot fetch user badges');
        return Promise.resolve([]); // Return empty array if no userId
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Debug logging for user badges fetch
  if (userBadgesIsFetched && !userBadgesError) {
    console.log('[useUserBadges] User badges fetched successfully:', {
      count: userBadges?.length,
      userBadges: userBadges?.map((ub: UserEarnedBadge) => ({ 
        id: ub.id, 
        badgeId: ub.badge, 
        earnedAt: ub.earned_at 
      }))
    });
  }
  if (userBadgesError) {
    console.error('[useUserBadges] Error fetching user badges:', userBadgesError);
  }

  // Award badge mutation
  const awardBadgeMutation = useMutation<UserEarnedBadge, Error, string>({
    mutationFn: (badgeId: string) => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return awardBadgeApi(userId, badgeId, vkId);
    },
    onSuccess: (newBadge) => {
      // Update the user badges cache
      queryClient.setQueryData(['userBadges', userId], (oldData: UserEarnedBadge[] = []) => {
        return [...oldData, newBadge];
      });
    },
    onError: (error) => {
      console.error('Error awarding badge:', error);
    },
  });

  const awardBadge = async (badgeId: string): Promise<UserEarnedBadge | null> => {
    try {
      const result = await awardBadgeMutation.mutateAsync(badgeId);
      return result;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return null;
    }
  };

  const refetchBadges = async () => {
    await refetchBadgesQuery();
  };

  const refetchUserBadges = async () => {
    await refetchUserBadgesQuery();
  };

  // Check for new badges and show notifications
  useEffect(() => {
    const checkNewBadges = async () => {
      if (!userBadges.length || !badges.length) return;

      try {
        const lastCheckTimestamp = await getLastBadgeCheckTimestamp();

        // Find badges that should show notifications
        const newBadges = userBadges.filter(userBadge =>
          shouldShowBadgeNotification(userBadge.earned_at, lastCheckTimestamp)
        );

        // Show notification for each new badge
        for (const userBadge of newBadges) {
          const badgeInfo = badges.find(b => b.id === userBadge.badge);
          if (badgeInfo) {
            showBadgeNotification({
              id: badgeInfo.id,
              name: badgeInfo.name,
              description: badgeInfo.description || ''
            });
          }
        }

        // Update the last check timestamp if we found new badges
        if (newBadges.length > 0) {
          await updateLastBadgeCheckTimestamp();
        }
      } catch (error) {
        console.error('Error checking for new badges:', error);
      }
    };

    // Only check after both badges and userBadges are loaded
    if (!badgesLoading && !userBadgesLoading && userBadges.length > 0) {
      checkNewBadges();
    }
  }, [userBadges, badges, badgesLoading, userBadgesLoading, showBadgeNotification]);

  const loading = badgesLoading || userBadgesLoading;
  const isFetched = badgesIsFetched && userBadgesIsFetched;
  const error = badgesError?.message || userBadgesError?.message || null;

  return {
    isFetched,
    badges,
    userBadges,
    loading,
    error,
    awardBadge,
    refetchBadges,
    refetchUserBadges,
  };
};

