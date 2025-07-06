import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock VK Bridge для тестов
(global as any).vkBridge = {
  send: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  isWebView: vi.fn(() => false),
  isStandalone: vi.fn(() => false),
  isEmbedded: vi.fn(() => false),
  supports: vi.fn(() => true),
};

// Mock для VKUI компонентов
vi.mock('@vkontakte/vkui', () => ({
  AdaptivityProvider: ({ children }: any) => children,
  ConfigProvider: ({ children }: any) => children,
  AppRoot: ({ children }: any) => children,
  SplitLayout: ({ children }: any) => children,
  SplitCol: ({ children }: any) => children,
  View: ({ children }: any) => children,
  Panel: ({ children }: any) => children,
  PanelHeader: ({ children }: any) => children,
  PanelHeaderBack: ({ children, onClick, label, ...props }: any) => 
    React.createElement('button', { onClick, ...props }, label || children),
  Group: ({ children }: any) => children,
  Cell: ({ children }: any) => children,
  Button: ({ children, ...props }: any) => 
    React.createElement('button', props, children),
  Input: (props: any) => React.createElement('input', props),
  FormItem: ({ children }: any) => children,
  Div: ({ children }: any) => React.createElement('div', {}, children),
  Title: ({ children }: any) => React.createElement('h1', {}, children),
  Text: ({ children }: any) => React.createElement('span', {}, children),
  Spacing: () => React.createElement('div', { style: { height: '12px' } }),
  usePlatform: () => 'ios',
  useAdaptivityConditionalRender: () => ({ viewWidth: { tabletPlus: false } }),
}));

// Mock для VK Bridge React
vi.mock('@vkontakte/vk-bridge-react', () => ({
  useRouteNavigator: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    showPopout: vi.fn(),
    hidePopout: vi.fn(),
  }),
}));
