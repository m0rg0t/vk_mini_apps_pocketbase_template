import React from 'react';
import { Snackbar, Avatar } from '@vkontakte/vkui';
import { Icon24Done } from '@vkontakte/icons';
import { useNotifications } from '../contexts/NotificationContext';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export const BadgeToast: React.FC = () => {
  const { notifications, dismissNotification } = useNotifications();
  const routeNavigator = useRouteNavigator();

  if (notifications.length === 0) {
    return null;
  }

  // Show only the most recent notification
  const currentNotification = notifications[notifications.length - 1];

  const handleClick = () => {
    dismissNotification(currentNotification.id);
    routeNavigator.push(`/badge_details/${currentNotification.badgeId}`);
  };

  return (
    <Snackbar
      placement='top'
      onClose={() => dismissNotification(currentNotification.id)}
      onClick={handleClick}
      before={
        <Avatar size={24} style={{ backgroundColor: '#4CAF50' }}>
          <Icon24Done fill="#FFFFFF" />
        </Avatar>
      }
      duration={5000}
      style={{ cursor: 'pointer' }}
    >
      <strong>🏆 Новый значок получен!</strong>
      <br />
      {currentNotification.badgeName}
    </Snackbar>
  );
};