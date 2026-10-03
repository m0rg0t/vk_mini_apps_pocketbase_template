import { Icon24ChevronRight } from "@vkontakte/icons";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import { Div, Panel, Spinner, Text } from "@vkontakte/vkui";
import { FC } from "react";
import { CustomHeader } from "../components";
import { useUniversalUser, useDownloadDiary, useInviteFriend } from "../hooks";
import { DEFAULT_VIEW_PANELS } from "../routes";
import styles from "./UserMenuPanel.module.css";
import bookOutlineIcon from "../assets/profile_page/book_outline.svg?url";
import helpCircleIcon from "../assets/profile_page/help_circle.svg?url";
import infoCircleIcon from "../assets/profile_page/info_circle.svg?url";
import likeOutlineIcon from "../assets/profile_page/like_outline.svg?url";
import documentTextIcon from "../assets/profile_page/document_text.svg?url";

export interface UserMenuPanelProps {
  id: string;
}

export const UserMenuPanel: FC<UserMenuPanelProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();

  // Получаем данные пользователя через vkBridge и PocketBase
  const {
    user: vkUser,
    loading: vkUserLoading,
    error: vkUserError,
  } = useUniversalUser();

  const { inviteFriend, isLoading: isInviting } = useInviteFriend(vkUser?.id);

  const handleShare = async () => {
    const result = await inviteFriend();
    
    if (result.success) {
      if (result.badgeAwarded) {
        console.log("Успешно отправили приглашение и получили бейдж!");
        // Здесь можно добавить toast уведомление о получении бейджа
      } else {
        console.log("Приглашение отправлено успешно");
      }
    } else {
      console.error("Ошибка при отправке приглашения:", result.error);
    }
  };

  const { downloadDiary, isLoading: isDownloadingDiary } = useDownloadDiary(vkUser?.id ?? '');

  return (
    <Panel id={id}>
      <div className={styles.profileContainer}>
        <CustomHeader title="Миллион книг" />

        {/* Показываем спиннер пока загружается пользователь */}
        {vkUserLoading && (
          <>
            <Div style={{ textAlign: "center", padding: "64px 0" }}>
              <Spinner size="l" />
              <Text
                style={{
                  marginTop: 16,
                  color: "var(--vkui--color_text_secondary)",
                }}
              >
                Загрузка данных пользователя...
              </Text>
            </Div>

            {/* Debug Panel - показываем всегда, даже при загрузке */}
            <div className={styles.menuSection}>
              {import.meta.env.DEV && (
                <button
                  className={styles.menuItem}
                  onClick={() =>
                    routeNavigator.push(
                      `/${DEFAULT_VIEW_PANELS.PROFILE}/${DEFAULT_VIEW_PANELS.DEBUG}`
                    )
                  }
                >
                  <span className={styles.menuIcon}>🔧</span>
                  <span className={styles.menuText}>Debug Panel</span>
                  <Icon24ChevronRight className={styles.menuArrow} />
                </button>
              )}
            </div>
          </>
        )}

        {/* Показываем ошибку, если не удалось загрузить пользователя */}
        {!vkUserLoading && vkUserError && (
          <Div style={{ textAlign: "center", padding: "64px 0" }}>
            <Text
              style={{
                color: "var(--vkui--color_text_negative)",
                marginBottom: 16,
              }}
            >
              Ошибка загрузки данных пользователя
            </Text>
            <Text style={{ color: "var(--vkui--color_text_secondary)" }}>
              {vkUserError}
            </Text>
          </Div>
        )}

        {/* Основной контент показываем только когда пользователь загружен и нет ошибки */}
        {!vkUserLoading && !vkUserError && vkUser && (
          <>
            {/* Секция пользователя */}
            <div className={styles.userSection}>
              <img
                src={vkUser.vk_info?.photo_200}
                alt="Аватар пользователя"
                className={styles.userAvatar}
                loading="lazy"
              />
              <div className={styles.userInfo}>
                <h2
                  className={styles.userName}
                >{`${vkUser.first_name} ${vkUser.last_name}`}</h2>
                {/* <p className={styles.userLocation}>Санкт-Петербург</p> */}
              </div>
            </div>

            {/* Разделитель */}
            <div className={styles.sectionDividerWrapper}>
              <div className={styles.sectionDivider}></div>
            </div>

            {/* Секция книг */}
            <div className={styles.menuSection}>
              <button
                className={styles.menuItem}
                disabled title="Раздел пока не реализован"
              >
                <img src={bookOutlineIcon} alt="" className={styles.menuIcon} />
                <span className={styles.menuText}>Мои книги</span>
                <Icon24ChevronRight className={styles.menuArrow} />
              </button>

              <button
                className={styles.menuItem}
                disabled title="Раздел пока не реализован"
              >
                <img src={likeOutlineIcon} alt="" className={styles.menuIcon} />
                <span className={styles.menuText}>Хочу прочитать</span>
                <Icon24ChevronRight className={styles.menuArrow} />
              </button>

              <button 
                className={styles.menuItem} 
                onClick={downloadDiary}
                disabled={isDownloadingDiary}
              >
                <img src={documentTextIcon} alt="" className={styles.menuIcon} />
                <span className={styles.menuText}>
                  {isDownloadingDiary ? "Создаем PDF..." : "Скачать читательский дневник"}
                </span>
                {isDownloadingDiary ? (
                  <Spinner size="s" style={{ marginLeft: 'auto' }} />
                ) : (
                  <Icon24ChevronRight className={styles.menuArrow} />
                )}
              </button>
            </div>

            {/* Разделитель */}
            <div className={styles.sectionDividerWrapper}>
              <div className={styles.sectionDivider}></div>
            </div>

            {/* Секция помощи и информации */}
            <div className={styles.menuSection}>
              <button
                className={styles.menuItem}
                onClick={handleShare}
                disabled={isInviting}
              >
                <img src={helpCircleIcon} alt="" className={styles.menuIcon} />
                <span className={styles.menuText}>
                  {isInviting ? "Отправляем..." : "Пригласить друга"}
                </span>
                <Icon24ChevronRight className={styles.menuArrow} />
              </button>

              <button
                className={styles.menuItem}
                onClick={() =>
                  routeNavigator.push(`/${DEFAULT_VIEW_PANELS.ABOUT}`)
                }
              >
                <img src={infoCircleIcon} alt="" className={styles.menuIcon} />
                <span className={styles.menuText}>О приложении</span>
                <Icon24ChevronRight className={styles.menuArrow} />
              </button>

              {/* Debug Panel - временно включен по умолчанию */}
              {(import.meta.env.DEV || localStorage.getItem('debug_mode') === 'true') && (
                <button
                  className={styles.menuItem}
                  onClick={() =>
                    routeNavigator.push(
                      `/${DEFAULT_VIEW_PANELS.PROFILE}/${DEFAULT_VIEW_PANELS.DEBUG}`
                    )
                  }
                >
                  <span className={styles.menuIcon}>🔧</span>
                  <span className={styles.menuText}>Debug Panel</span>
                  <Icon24ChevronRight className={styles.menuArrow} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Panel>
  );
};
