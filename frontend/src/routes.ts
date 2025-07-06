import { createHashRouter, createPanel, createRoot, createView, RoutesConfig } from '@vkontakte/vk-mini-apps-router';

export const DEFAULT_ROOT = 'default_root';
export const DEFAULT_VIEW = 'default_view';

export const DEFAULT_VIEW_PANELS = {
  HOME: 'home',
  PROFILE: 'profile',
  USER_BADGES: 'user_badges',
  BADGE_DETAILS: 'badge_details',
  ABOUT: 'about',
  DEBUG: 'debug',
} as const;

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [
      createPanel(DEFAULT_VIEW_PANELS.HOME, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.BADGE_DETAILS, `/${DEFAULT_VIEW_PANELS.BADGE_DETAILS}/:badgeId`, []),
      createPanel(DEFAULT_VIEW_PANELS.PROFILE, `/${DEFAULT_VIEW_PANELS.PROFILE}`, []),
      createPanel(
        DEFAULT_VIEW_PANELS.USER_BADGES,
        `/${DEFAULT_VIEW_PANELS.PROFILE}/${DEFAULT_VIEW_PANELS.USER_BADGES}`,
        []
      ),
      createPanel(DEFAULT_VIEW_PANELS.ABOUT, `/${DEFAULT_VIEW_PANELS.ABOUT}`, []),
      createPanel(
        DEFAULT_VIEW_PANELS.DEBUG,
        `/${DEFAULT_VIEW_PANELS.PROFILE}/${DEFAULT_VIEW_PANELS.DEBUG}`,
        []
      ),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
