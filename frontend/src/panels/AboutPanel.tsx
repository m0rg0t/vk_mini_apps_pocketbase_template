import { FC } from 'react';
import { Panel, Div } from '@vkontakte/vkui';
import { CustomHeader } from '../components';
import styles from './AboutPanel.module.css';

export interface AboutPanelProps {
  id: string;
}

export const AboutPanel: FC<AboutPanelProps> = ({ id }) => (
  <Panel id={id}>
    <CustomHeader title='О приложении'/>
    
    {/* Основная информация */}
    <Div className={styles.aboutCard}>
      <p className={styles.aboutHeader}>О приложении</p>
      <p className={styles.aboutDescription}>
        Мини-приложение "Книжный челлендж" помогает отслеживать ваш прогресс в чтении.
      </p>
    </Div>

    {/* Контактная информация */}
    <Div className={styles.contactCard}>
      <p className={styles.contactHeader}>Контакты</p>
      <div className={styles.contactItem}>
        <span className={styles.contactLabel}>Наш сайт:</span>
        <a 
          rel="noopener" 
          href="https://millionknig.ru/" 
          target='_blank'
          className={styles.contactLink}
        >
          millionknig.ru
        </a>
      </div>
      <div className={styles.contactItem}>
        <span className={styles.contactLabel}>Наша почта:</span>
        <a 
          rel="noopener" 
          target="_blank" 
          href="mailto:info@millionknig.ru"
          className={styles.contactLink}
        >
          info@millionknig.ru
        </a>
      </div>
    </Div>

    {/* Пользовательское соглашение */}
    <Div className={styles.contactCard}>
      <p className={styles.contactHeader}>Пользовательское соглашение</p>
      <div className={styles.contactItem}>
        <a 
          rel="noopener" 
          href={`${window.location.origin}/user_policy.pdf`}
          target='_blank'
          className={styles.contactLink}
        >
          Пользовательское соглашение (PDF)
        </a>
      </div>
    </Div>
  </Panel>
);
