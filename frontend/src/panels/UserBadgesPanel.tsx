import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Panel, Spinner, Text } from '@vkontakte/vkui';
import { FC, useEffect } from 'react';
import { CustomHeader } from '../components';
import { useUserBadges } from '../hooks';
import { DEFAULT_VIEW_PANELS } from '../routes';
import styles from './UserBadgesPanel.module.css';

export interface UserBadgesPanelProps {
  id: string;
}

export const UserBadgesPanel: FC<UserBadgesPanelProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();

  // Получаем бейджи пользователя
  const { userBadges, badges, loading, error, refetchUserBadges } = useUserBadges();

  useEffect(() => {
    refetchUserBadges();
  }, []);

  // Получаем ID бейджей, которые есть у пользователя
  const userBadgeIds = userBadges.map((ub) => ub.badge);

  // Считаем прогресс
  const earnedCount = userBadgeIds.length;
  const totalCount = badges.length;
  const progressPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  const handleBadgeClick = (badgeId: string) => {
    routeNavigator.push(`/${DEFAULT_VIEW_PANELS.BADGE_DETAILS}/${badgeId}`);
  };

  if (loading) {
    return (
      <Panel id={id}>
        <div className={styles.badgesContainer}>
          <CustomHeader title="Миллион книг" />
          <div className={styles.loadingContainer}>
            <Spinner size="l" />
          </div>
        </div>
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel id={id}>
        <div className={styles.badgesContainer}>
          <CustomHeader title="Миллион книг" />
          <div className={styles.errorContainer}>
            <Text className={styles.errorText}>{error}</Text>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel id={id}>
      <CustomHeader title="Миллион книг" />

      {/* Заголовок секции */}
      <Text weight="2" className={styles.progressTitle}>
        Бейджи
      </Text>

      {/* Прогресс */}
      <div className={styles.progressSection}>
        <Text className={styles.progressText}>
          Полученные достижения ({earnedCount}/{totalCount})
        </Text>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      {/* Сетка бейджей */}
      {badges.length === 0 ? (
        <div className={styles.emptyState}>
          <Text className={styles.emptyText}>Бейджи не найдены</Text>
        </div>
      ) : (
        <div className={styles.badgesGrid}>
          {badges.map((badge) => {
            const isEarned = userBadgeIds.includes(badge.id);

            return (
              <button key={badge.id} className={styles.badgeItem} onClick={() => handleBadgeClick(badge.id)}>
                <img
                  src={badge.imageUrl}
                  alt={badge.name}
                  className={`${styles.badgeImage} ${!isEarned ? styles.badgeImageGrayscale : ''}`}
                  loading="lazy"
                />
                <Text className={styles.badgeName}>{badge.name}</Text>
              </button>
            );
          })}
        </div>
      )}
    </Panel>
  );
};
