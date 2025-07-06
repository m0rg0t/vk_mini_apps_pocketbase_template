import { View, SplitLayout, SplitCol } from "@vkontakte/vkui";
import { useActiveVkuiLocation } from "@vkontakte/vk-mini-apps-router";
import { useEffect } from "react";

import { VKAPP_ENTRY_KEY } from "./constants";

import {
  Home,
  UserMenuPanel,
  UserBadgesPanel,
  BadgeDetailsPanel,
  AboutPanel,
  // DebugPanel,
} from "./panels";
import { Tabbar, BadgeToast } from "./components";
import { DEFAULT_VIEW_PANELS } from "./routes";
import { NotificationProvider } from "./contexts/NotificationContext";

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } =
    useActiveVkuiLocation();

  useEffect(() => {
    if (!sessionStorage.getItem(VKAPP_ENTRY_KEY)) {
      sessionStorage.setItem(VKAPP_ENTRY_KEY, "1");
    }
  }, []);

  // Определяем, нужно ли показывать тапбар на текущей странице
  const shouldShowTabbar = [
    DEFAULT_VIEW_PANELS.HOME,
    DEFAULT_VIEW_PANELS.PROFILE,
    DEFAULT_VIEW_PANELS.USER_BADGES,
    DEFAULT_VIEW_PANELS.BADGE_DETAILS,
  ].includes(activePanel as typeof DEFAULT_VIEW_PANELS.HOME);

  return (
    <NotificationProvider>
      <SplitLayout>
        <SplitCol>
          <View activePanel={activePanel}>
            <Home id={DEFAULT_VIEW_PANELS.HOME} />
            <UserMenuPanel id={DEFAULT_VIEW_PANELS.PROFILE} />
            <UserBadgesPanel id={DEFAULT_VIEW_PANELS.USER_BADGES} />
            <AboutPanel id={DEFAULT_VIEW_PANELS.ABOUT} />
            <BadgeDetailsPanel id={DEFAULT_VIEW_PANELS.BADGE_DETAILS} />
            {/* <DebugPanel id={DEFAULT_VIEW_PANELS.DEBUG} /> */}
          </View>
          {shouldShowTabbar && <Tabbar />}
          <BadgeToast />
        </SplitCol>
      </SplitLayout>
    </NotificationProvider>
  );
};
