import vkBridge from '@vkontakte/vk-bridge';
import { useParams } from '@vkontakte/vk-mini-apps-router';
import { Panel, Spinner, Text } from '@vkontakte/vkui';
import { FC } from 'react';
import { CustomHeader } from '../components';
import { useBackendUserBooks, useUserBadges } from '../hooks';
import { checkBadgeCondition, getBadgeDescription } from '../utils/badgeUtils';
import styles from './BadgeDetailsPanel.module.css';

export interface BadgeDetailsPanelProps {
  id: string;
}

export const BadgeDetailsPanel: FC<BadgeDetailsPanelProps> = ({ id }) => {
  const params = useParams();
  const badgeId = params?.badgeId as string | undefined;

  const { completedBooks } = useBackendUserBooks();

  const { userBadges, badges, loading, error } = useUserBadges();

  const badge = badges.find((b) => b.id === badgeId);
  const userBadgeIds = userBadges.map((ub) => ub.badge);
  const isEarned = badge ? userBadgeIds.includes(badge.id) : false;

  // Считаем прогресс для конкретного бейджа
  let badgeProgress = { progress: 0, maxProgress: 1 };
  if (badge) {
    const booksReadCount = completedBooks?.length || 0;
    const badgeCheck = checkBadgeCondition(badge, booksReadCount);
    badgeProgress = {
      progress: badgeCheck.progress || 0,
      maxProgress: badgeCheck.maxProgress || 1,
    };
  }

  const handleShareBadge = async () => {
    if (!badge || !isEarned) {
      console.log('Cannot share badge: badge not found or not earned', { badge, isEarned });
      return;
    }

    try {
      // Создаем абсолютную ссылку на изображение бейджа
      const absoluteImageUrl = badge.imageUrl?.startsWith('http')
        ? badge.imageUrl
        : `${window.location.origin}${badge.imageUrl}`;

      const background = `${window.location.origin}/backgrounds/bg1.jpg`;

      const appUrl = `https://vk.com/app${import.meta.env.VITE_VK_APP_ID || "53603553"}#/`;

      await vkBridge.send('VKWebAppShowStoryBox', {
        background_type: 'image',
        url: background,
        attachment: {
          text: 'learn_more',
          type: 'url',
          url: appUrl,
        },
        stickers: [
          {
            sticker_type: 'renderable',
            sticker: {
              content_type: 'image',
              url: absoluteImageUrl,
              can_delete: false,
              transform: {
                relation_width: 0.4,
                gravity: 'center_top',
                translation_y: 0.1
              }
            }
          },
          {
            sticker_type: "native",
            sticker: {
              action_type: "text",
              action: {
                text: `Я получил бейдж\n«${badge.name}»\nв приложении\nЧеллендж «Миллион книг»!`,
                style: "classic",
                background_style: "solid",
                alignment: "center",
                selection_color: "#FFFFFF",
              },
              transform: {
                translation_y: -0.15,
                relation_width: 0.6,
                gravity: "center_bottom",
              },
            },
          },
        ]
      });
    } catch (error) {
      console.error('Ошибка при попытке поделиться достижением:', error);
    }
  };

  if (loading) {
    return (
      <Panel id={id}>
        <div className={styles.badgeDetailContainer}>
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
        <div className={styles.badgeDetailContainer}>
          <CustomHeader title="Миллион книг" />
          <div className={styles.errorContainer}>
            <Text className={styles.errorText}>{error}</Text>
          </div>
        </div>
      </Panel>
    );
  }

  if (!badge) {
    return (
      <Panel id={id}>
        <div className={styles.badgeDetailContainer}>
          <CustomHeader title="Миллион книг" />
          <div className={styles.notFoundContainer}>
            <Text className={styles.notFoundText}>Достижение не найдено</Text>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel id={id}>
      <div className={styles.badgeDetailContainer}>
        <CustomHeader title="Миллион книг" />

        <div className={styles.contentContainer}>
          {/* Название бейджа */}
          <Text className={styles.badgeName}>{badge.name}</Text>

          {/* Изображение бейджа */}
          <div className={styles.badgeImageContainer}>
            <img
              src={badge.imageUrl}
              alt={badge.name}
              className={`${styles.badgeImage} ${!isEarned ? styles.badgeImageGrayscale : ''}`}
            />
          </div>

          {/* Прогресс */}
          <div className={styles.progressSection}>
            <Text className={styles.progressText}>
              ({badgeProgress.progress}/{badgeProgress.maxProgress})
            </Text>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${badgeProgress.maxProgress > 0 ? (badgeProgress.progress / badgeProgress.maxProgress) * 100 : 0
                    }%`,
                }}
              />
            </div>
          </div>

          {/* Требования для получения */}
          <div className={styles.requirementsSection}>
            <Text className={styles.requirementsTitle}>Что нужно для получения</Text>
            <Text className={styles.requirementsDescription}>
              {badge.criteria ? getBadgeDescription(badge) : badge.description}
            </Text>
          </div>

          {/* Кнопка поделиться (только для полученных бейджей) */}
          {isEarned && (
            <button
              onClick={handleShareBadge}
              className={styles.shareButton}
            >
              Поделиться
            </button>
          )}
        </div>
      </div>
    </Panel>
  );
};
