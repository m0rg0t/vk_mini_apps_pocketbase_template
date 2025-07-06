import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BadgeNotification {
  id: string;
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  timestamp: number;
}

interface NotificationContextType {
  notifications: BadgeNotification[];
  showBadgeNotification: (badge: { id: string; name: string; description: string }) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<BadgeNotification[]>([]);

  const showBadgeNotification = (badge: { id: string; name: string; description: string }) => {
    const notification: BadgeNotification = {
      id: `badge-${badge.id}-${Date.now()}`,
      badgeId: badge.id,
      badgeName: badge.name,
      badgeDescription: badge.description,
      timestamp: Date.now(),
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value: NotificationContextType = {
    notifications,
    showBadgeNotification,
    dismissNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};