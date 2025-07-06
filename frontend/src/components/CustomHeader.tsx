import { FC } from "react";
import { Icon24ChevronLeft } from "@vkontakte/icons";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import styles from "./CustomHeader.module.css";
import { VKAPP_ENTRY_KEY } from "../constants";

export interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export const CustomHeader: FC<CustomHeaderProps> = ({
  title,
  showBackButton = true,
}) => {
  const routeNavigator = useRouteNavigator();

  const handleBackClick = () => {
    if (sessionStorage.getItem(VKAPP_ENTRY_KEY) === "1") {
      sessionStorage.removeItem(VKAPP_ENTRY_KEY);
      routeNavigator.replace("/");
      return;
    }
    routeNavigator.back();
  };

  return (
    <div className={styles.customHeader}>
      {showBackButton && (
        <button className={styles.backButton} onClick={handleBackClick}>
          <Icon24ChevronLeft />
        </button>
      )}
      <span className={styles.headerTitle}>{title}</span>
    </div>
  );
};
