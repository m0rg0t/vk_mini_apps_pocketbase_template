# Тестирование в проекте

В проекте настроен **Vitest** для тестирования JavaScript/TypeScript кода и React компонентов.

## Доступные команды

- `npm test` - запуск тестов в watch режиме
- `npm run test:run` - однократный запуск всех тестов  
- `npm run test:ui` - запуск тестов с веб-интерфейсом
- `npm run test:coverage` - запуск тестов с отчетом о покрытии кода

## Структура тестов

```
src/
  components/
    __tests__/
  utils/
    __tests__/
      badgeCriteria.test.ts
      badgeUtils.test.ts
  test/
    setup.ts        # Настройка окружения для тестов
    vitest.d.ts     # Типы для Vitest
```

## Конфигурация

- `vite.config.ts` - основная конфигурация Vitest
- `src/test/setup.ts` - настройка глобальных моков (VK Bridge, VKUI компонентов)
- `tsconfig.json` - включает типы для Vitest globals

## Запуск в VS Code

1. Используйте задачи из Command Palette (`Ctrl+Shift+P`):
   - "Tasks: Run Task" → "Run Tests"
   - "Tasks: Run Task" → "Run Tests UI" 
   - "Tasks: Run Task" → "Run Tests Coverage"

2. Или запустите через Debug panel конфигурации:
   - "Run Vitest" - однократный запуск
   - "Run Vitest Watch" - watch режим

## Покрытие кода

После выполнения `npm run test:coverage` отчет о покрытии будет доступен в:
- Консоли (текстовый формат)
- `coverage/index.html` (HTML отчет)
- `coverage/coverage-final.json` (JSON формат)

## Написание тестов

### Для утилит:
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myModule';

describe('myModule', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### Для React компонентов:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Моки

В `setup.ts` настроены моки для:
- VK Bridge API
- VKUI компонентов  
- VK Mini Apps Router

Дополнительные моки можно добавлять в отдельных тестах с помощью `vi.mock()`.
