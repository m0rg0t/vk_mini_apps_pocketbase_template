import vkBridge from '@vkontakte/vk-bridge';

const STORAGE_KEY = 'lastBadgeCheckTimestamp';

/**
 * Get the timestamp of the last badge notification check from VK storage
 */
export const getLastBadgeCheckTimestamp = async (): Promise<number> => {
  try {
    const result = await vkBridge.send('VKWebAppStorageGet', {
      keys: [STORAGE_KEY]
    });
    
    const timestampValue = result.keys.find(item => item.key === STORAGE_KEY)?.value;
    return timestampValue ? parseInt(timestampValue, 10) : 0;
  } catch (error) {
    console.error('Error getting last badge check timestamp:', error);
    return 0; // Default to 0 if error occurs
  }
};

/**
 * Store the current timestamp as the last badge notification check
 */
export const updateLastBadgeCheckTimestamp = async (): Promise<void> => {
  try {
    const timestamp = Date.now().toString();
    await vkBridge.send('VKWebAppStorageSet', {
      key: STORAGE_KEY,
      value: timestamp
    });
  } catch (error) {
    console.error('Error updating last badge check timestamp:', error);
  }
};

/**
 * Check if a badge should show a notification based on its earned_at date
 */
export const shouldShowBadgeNotification = (badgeEarnedAt: string, lastCheckTimestamp: number): boolean => {
  const earnedTimestamp = new Date(badgeEarnedAt).getTime();
  return earnedTimestamp > lastCheckTimestamp;
};