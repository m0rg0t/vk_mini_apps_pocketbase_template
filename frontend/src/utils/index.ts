export { transformVKBridgeAdaptivity } from './transformVKBridgeAdaptivity';
export { pb, handlePocketBaseError } from './pocketbase';
export { 
  checkBadgeCondition, 
  checkAllBadges, 
  getNewlyEarnedBadges,
  type BadgeCheckResult 
} from './badgeUtils';
export * from './badgeNotificationStorage';
export { detectPlatform, isPlatform, isVK, isTelegram, type Platform } from './platformDetection';
