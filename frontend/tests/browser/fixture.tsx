import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AdaptivityProvider, AppRoot, Button, ConfigProvider, Div, Group, Panel, PanelHeader, Text } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import { authenticatedFetch } from '../../src/utils/authenticatedFetch';
export function Fixture() {
  const [status, setStatus] = useState('Готово к проверке');
  const [busy, setBusy] = useState(false);
  async function request(decline: boolean) {
    setBusy(true);
    sessionStorage.setItem('fixture-decline', String(decline));
    try {
      const response = await authenticatedFetch('/api/fixture', { vkId: 123 });
      const body = await response.json();
      setStatus(body.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Ошибка');
    } finally { setBusy(false); }
  }
  return <ConfigProvider><AdaptivityProvider><AppRoot><Panel id="fixture">
    <PanelHeader>Проверка входа VK</PanelHeader><Group><Div>
      <Text>Изолированный браузерный сценарий с синтетическими данными</Text>
      <Div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Button disabled={busy} onClick={() => request(false)}>Подписанный запрос</Button>
        <Button disabled={busy} mode="secondary" onClick={() => request(true)}>Отказ подписи</Button>
      </Div>
      <div role="status" aria-live="polite">{status}</div>
    </Div></Group>
  </Panel></AppRoot></AdaptivityProvider></ConfigProvider>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
