import { Panel, Div, Text, Spacing, Separator } from "@vkontakte/vkui";
import { FC, useState } from "react";
import { CustomHeader } from "../components";
import { useUniversalUser, useUserBadges, useBackendUserBooks } from "../hooks";
import { detectPlatform } from "../utils/platformDetection";
import styles from "./DebugPanel.module.css";

export interface DebugPanelProps {
  id: string;
}

const JsonViewer: FC<{ title: string; data: any; collapsed?: boolean }> = ({ 
  title, 
  data, 
  collapsed = false 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  
  return (
    <div className={styles.jsonSection}>
      <button 
        className={styles.jsonToggle}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Text weight="2" className={styles.jsonTitle}>
          {isCollapsed ? "▶" : "▼"} {title}
        </Text>
      </button>
      {!isCollapsed && (
        <pre className={styles.jsonContent}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export const DebugPanel: FC<DebugPanelProps> = ({ id }) => {
  const platform = detectPlatform();
  const { user, loading: userLoading, error: userError } = useUniversalUser();
  const { badges, userBadges, loading: badgesLoading, error: badgesError } = useUserBadges();
  const { 
    allBooks, 
    completedBooks, 
    readingBooks, 
    loading: booksLoading, 
    error: booksError,
    isEmpty,
    hasCompletedBooks,
    hasReadingBooks
  } = useBackendUserBooks();

  const debugInfo = {
    timestamp: new Date().toISOString(),
    platform,
    environment: {
      viteMode: import.meta.env.MODE,
      vkAppId: import.meta.env.VITE_VK_APP_ID,
      backendUrl: import.meta.env.VITE_BACKEND_URL,
      userAgent: navigator.userAgent,
    },
    loadingStates: {
      userLoading,
      badgesLoading,
      booksLoading,
    },
    errors: {
      userError,
      badgesError,
      booksError,
    },
    computedStates: {
      isEmpty,
      hasCompletedBooks,
      hasReadingBooks,
    },
    counts: {
      totalBadges: badges?.length || 0,
      userBadges: userBadges?.length || 0,
      allBooks: allBooks?.length || 0,
      completedBooks: completedBooks?.length || 0,
      readingBooks: readingBooks?.length || 0,
    }
  };

  return (
    <Panel id={id}>
      <div className={styles.debugContainer}>
        <CustomHeader title="Debug Panel" />
        
        <Div>
          <Text weight="2" style={{ fontSize: 18, marginBottom: 16 }}>
            🔧 Debug Information
          </Text>
          
          <Text style={{ color: "var(--vkui--color_text_secondary)", marginBottom: 16 }}>
            Информация для отладки и диагностики проблем
          </Text>

          <JsonViewer title="Debug Summary" data={debugInfo} />
          
          <Separator />
          <Spacing size={16} />

          <JsonViewer 
            title={`User Data ${user ? '✅' : '❌'}`} 
            data={user} 
            collapsed={true}
          />
          
          <Separator />
          <Spacing size={16} />

          <JsonViewer 
            title={`All Badges (${badges?.length || 0})`} 
            data={badges} 
            collapsed={true}
          />
          
          <Separator />
          <Spacing size={16} />

          <JsonViewer 
            title={`User Badges (${userBadges?.length || 0})`} 
            data={userBadges} 
            collapsed={true}
          />
          
          <Separator />
          <Spacing size={16} />

          <JsonViewer 
            title={`All Books (${allBooks?.length || 0})`} 
            data={allBooks} 
            collapsed={true}
          />
          
          <Separator />
          <Spacing size={16} />

          <JsonViewer 
            title={`Completed Books (${completedBooks?.length || 0})`} 
            data={completedBooks} 
            collapsed={true}
          />
          
          <Separator />
          <Spacing size={16} />

          <JsonViewer 
            title={`Reading Books (${readingBooks?.length || 0})`} 
            data={readingBooks} 
            collapsed={true}
          />

          <Separator />
          <Spacing size={16} />

          <JsonViewer 
            title="Local Storage" 
            data={Object.fromEntries(
              Object.entries(localStorage).map(([key, value]) => [
                key, 
                key.includes('token') || key.includes('secret') ? '[HIDDEN]' : value
              ])
            )} 
            collapsed={true}
          />

          <Separator />
          <Spacing size={16} />

          <JsonViewer 
            title="Session Storage" 
            data={Object.fromEntries(
              Object.entries(sessionStorage).map(([key, value]) => [
                key, 
                key.includes('token') || key.includes('secret') ? '[HIDDEN]' : value
              ])
            )} 
            collapsed={true}
          />

          <Spacing size={32} />
          
          <Text style={{ 
            color: "var(--vkui--color_text_secondary)", 
            fontSize: 12,
            textAlign: "center" 
          }}>
            Generated at {debugInfo.timestamp}
          </Text>
        </Div>
      </div>
    </Panel>
  );
};