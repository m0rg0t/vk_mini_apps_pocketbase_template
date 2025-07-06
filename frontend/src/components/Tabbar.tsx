import { useRouteNavigator, useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';
import { Icon28HomeOutline, Icon28User, Icon28CupOutline } from '@vkontakte/icons';
import { DEFAULT_VIEW_PANELS } from '../routes';
import styles from './Tabbar.module.css';

export const Tabbar = () => {
  const routeNavigator = useRouteNavigator();
  const { panel: activePanel } = useActiveVkuiLocation();

  const handleTabClick = (panel: string) => {
    if (panel === DEFAULT_VIEW_PANELS.HOME) {
      routeNavigator.push('/');
    } else {
      routeNavigator.push(`/${panel}`);
    }
  };

  const getActiveTab = () => {
    switch (activePanel) {
      case DEFAULT_VIEW_PANELS.HOME:
        return 'home';
      case DEFAULT_VIEW_PANELS.USER_BADGES:
      case DEFAULT_VIEW_PANELS.BADGE_DETAILS:
        return 'badges';
      case DEFAULT_VIEW_PANELS.PROFILE:
        return 'profile';
      default:
        return 'home';
    }
  };

  const activeTab = getActiveTab();

  return (
    <div className={styles.tabbar}>
      <button
        onClick={() => handleTabClick(DEFAULT_VIEW_PANELS.HOME)}
        className={`${styles.tabbarItem} ${activeTab === 'home' ? styles.active : ''}`}
      >
        <Icon28HomeOutline style={{ color: activeTab === 'home' ? 'var(--vkui--color_icon_accent)' : 'var(--vkui--color_icon_secondary)' }} />
        <span>Главная</span>
      </button>

      <button
        onClick={() => handleTabClick(`${DEFAULT_VIEW_PANELS.PROFILE}/${DEFAULT_VIEW_PANELS.USER_BADGES}`)}
        className={`${styles.tabbarItem} ${activeTab === 'badges' ? styles.active : ''}`}
      >
        <Icon28CupOutline style={{ color: activeTab === 'badges' ? 'var(--vkui--color_icon_accent)' : 'var(--vkui--color_icon_secondary)' }} />
        <span>Достижения</span>
      </button>

      <button
        onClick={() => handleTabClick(DEFAULT_VIEW_PANELS.PROFILE)}
        className={`${styles.tabbarItem} ${activeTab === 'profile' ? styles.active : ''}`}
      >
        <Icon28User style={{ color: activeTab === 'profile' ? 'var(--vkui--color_icon_accent)' : 'var(--vkui--color_icon_secondary)' }} />
        <span>Профиль</span>
      </button>
    </div>
  );
};
