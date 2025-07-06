import { FC } from 'react';
import { Div, Spinner, Text } from '@vkontakte/vkui';

export const UserLoading: FC = () => (
  <Div style={{ textAlign: 'center', padding: '64px 0' }}>
    <Spinner size="l" />
    <Text style={{ marginTop: 16, color: 'var(--vkui--color_text_secondary)' }}>
      Загрузка данных пользователя...
    </Text>
  </Div>
);
