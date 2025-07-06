import { Icon24MoreHorizontal, Icon24Cancel } from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Avatar, Div, NavIdProps, Panel } from '@vkontakte/vkui';
import { FC, useEffect } from 'react';
import { UserLoading, UserError, AchievementsSection } from './components';
import { useUserBadges, useUniversalUser } from '../../hooks';
import { DEFAULT_VIEW_PANELS } from '../../routes';
import styles from './Home.module.css';

export interface HomeProps extends NavIdProps { }

export const Home: FC<HomeProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const { user: vkUser, loading: vkUserLoading, error: vkUserError } = useUniversalUser();

  const { refetchUserBadges } = useUserBadges();
  useEffect(() => {
    refetchUserBadges();
  }, []);

  return (
    <Panel id={id}>
      {/* Показываем спиннер пока загружается пользователь */}
      {vkUserLoading && <UserLoading />}

      {/* Показываем ошибку, если не удалось загрузить пользователя */}
      {!vkUserLoading && vkUserError && <UserError error={vkUserError} />}

      {/* Основной контент показываем только когда пользователь загружен и нет ошибки */}
      {!vkUserLoading && !vkUserError && vkUser && (
        <>
          {/* Баннер */}
          <div className={styles.bannerHeader}>
            <div className={styles.bannerTop}>
              <span className={styles.bannerTopTitle}>Mini App Template</span>
              <div className={styles.bannerTopButtons}>
                <Icon24MoreHorizontal className={styles.bannerButton} />
                <Icon24Cancel className={styles.bannerButton} />
              </div>
            </div>
            <div className={styles.bannerContent}>
              <h1 className={styles.bannerTitle}>
                Универсальное
                <br />
                приложение
              </h1>
            </div>
          </div>

          {/* Секция приветствия */}
          <Div
            className={styles.welcomeCard}
            onClick={() => routeNavigator.push(`/${DEFAULT_VIEW_PANELS.PROFILE}`)}
            style={{ cursor: 'pointer' }}
          >
            <p className={styles.welcomeTop}>Добро пожаловать!</p>
            <div className={styles.welcomeRow}>
              <Avatar src={vkUser.vk_info?.photo_200 || vkUser.telegram_info?.photo_url} size={64} />
              <span className={styles.welcomeName}>{`${vkUser.first_name} ${vkUser.last_name}`}</span>
            </div>
            <p className={styles.welcomeDescription}>
              Шаблон для создания VK и Telegram мини-приложений
            </p>
          </Div>

          {/* Достижения */}
          <AchievementsSection />
        </>
      )}
    </Panel>
  );
};
