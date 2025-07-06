import { FC } from 'react';
import { Div, Text } from '@vkontakte/vkui';

interface UserErrorProps {
  error: string;
}

export const UserError: FC<UserErrorProps> = ({ error }) => (
  <Div style={{ textAlign: 'center', padding: '64px 0' }}>
    <Text style={{ color: 'var(--vkui--color_text_negative)', marginBottom: 16 }}>
      Ошибка загрузки данных пользователя
    </Text>
    <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>{error}</Text>
  </Div>
);
