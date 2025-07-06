import { Icon20Stars, Icon24BooksOutline } from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Card, Div, Spinner, Text } from '@vkontakte/vkui';
import { FC } from 'react';
import { useBackendUserBooks, useUserBadges } from '../../../hooks';
import { DEFAULT_VIEW_PANELS } from '../../../routes';
import { declineBadge, declineBook } from '../../../utils/declension';
import styles from '../Home.module.css';

export interface AchievementsSectionProps {}

interface AchievementCardProps {
  loading: boolean;
  count: number;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const AchievementCard: FC<AchievementCardProps> = ({ loading, count, icon, label, onClick }) => (
  <Card mode="shadow" className={styles.achievementCard} onClick={onClick}>
    <Div className={styles.achievementContent}>
      {loading ? (
        <Spinner size="l" />
      ) : (
        <>
          <Text weight="2" className={styles.achievementNumber}>
            {count}
          </Text>
          {icon}
        </>
      )}
    </Div>
    {!loading && (
      <Text className={styles.achievementLabel}>
        {label}
      </Text>
    )}
  </Card>
);

export const AchievementsSection: FC<AchievementsSectionProps> = () => {
  const routeNavigator = useRouteNavigator();
  const { userBadges, loading: badgesLoading, isFetched: isBadgesFetched } = useUserBadges();
  const { completedBooks, loading: booksLoading, isFetched: isBooksDataFetched } = useBackendUserBooks();

  console.log("AchievementsSection", {
    badgesLoading,
    isBadgesFetched,
    booksLoading,
    isBooksDataFetched
  })

  const completedBooksCount = completedBooks?.length || 0;
  const badgesCount = userBadges?.length || 0;

  const getBooksLabel = (count: number) => {
    const bookWord = declineBook(count);
    const readWord = count % 10 === 1 ? 'прочитанa' : 'прочитано';
    return `${bookWord} ${readWord}`;
  };

  return (
    <Div className={styles.achievementsCard}>
      <p className={styles.achievementsHeader}>Мои достижения</p>
      <Div className={styles.achievementsGroup}>
        <AchievementCard
          loading={booksLoading || !isBooksDataFetched}
          count={completedBooksCount}
          icon={<Icon24BooksOutline className={styles.achievementIcon} />}
          label={getBooksLabel(completedBooksCount)}
          onClick={() => routeNavigator.push(`/${DEFAULT_VIEW_PANELS.PROFILE}/${DEFAULT_VIEW_PANELS.USER_BOOKS}`)}
        />
        <AchievementCard
          loading={badgesLoading || !isBadgesFetched}
          count={badgesCount}
          icon={<Icon20Stars className={styles.achievementIcon} />}
          label={declineBadge(badgesCount)}
          onClick={() => routeNavigator.push(`/${DEFAULT_VIEW_PANELS.PROFILE}/${DEFAULT_VIEW_PANELS.USER_BADGES}`)}
        />
      </Div>
    </Div>
  );
};
