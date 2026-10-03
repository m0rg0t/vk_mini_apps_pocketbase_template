# Universal Mini App Template

Универсальный шаблон для создания мини-приложений, работающих как в VKontakte, так и в Telegram.

## 🚀 Особенности

- **Универсальная платформа**: Автоматическое определение и поддержка VK и Telegram платформ
- **Готовая архитектура**: Frontend (React + VKUI) + Backend (Express) + Database (PocketBase)
- **Аутентификация**: Встроенная поддержка аутентификации пользователей для обеих платформ
- **Система достижений**: Готовая система бейджей для мотивации пользователей
- **Пользовательские данные**: Гибкая система хранения пользовательских настроек и данных
- **Docker поддержка**: Полная контейнеризация для простого развертывания
- **Готовые тесты**: Настроенное тестирование для всех компонентов
- **TypeScript**: Полная типизация для надежной разработки

## 🏗️ Архитектура

```
├── frontend/          # React + TypeScript + VKUI
├── backend/           # Express.js API сервер
├── pocketbase/        # База данных и бэкенд-логика
├── docker-compose.yaml
└── README.md
```

### Компоненты системы

1. **Frontend**: React-приложение с VKUI компонентами, поддерживающее обе платформы
2. **Backend**: Express.js сервер для API и бизнес-логики
3. **PocketBase**: База данных с встроенным REST API и админ-панелью

## 📦 Быстрый старт

### Требования
- Node.js 18+
- Docker и Docker Compose
- npm или yarn

### Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/your-username/universal-mini-app-template.git
cd universal-mini-app-template
```

2. **Настройте переменные окружения**
```bash
# Скопируйте и настройте переменные
cp .env.example .env
```

3. **Запустите в режиме разработки**
```bash
# Запуск всех сервисов
./start-dev.sh

# Или через Docker Compose
docker-compose -f docker-compose.dev.yaml up --build --watch
```

4. **Откройте приложение**
- Frontend: http://localhost:5173 (dev) или http://localhost:8080 (prod)
- Backend API: http://localhost:3000
- PocketBase Admin: http://localhost:8080/_/ (dev) или http://localhost:8090/_/ (prod)

## 🛠️ Разработка

### Структура проекта

#### Frontend (`/frontend`)
```
src/
├── components/        # Переиспользуемые компоненты
├── panels/           # Экраны приложения
├── hooks/            # React хуки для API
├── types/            # TypeScript типы
├── utils/            # Утилиты и хелперы
├── mocks/            # Mock данные для разработки
└── routes.ts         # Роутинг приложения
```

#### Backend (`/backend`)
```
routes/
├── health.js         # Проверка здоровья сервиса
├── vkUsers.js        # Управление пользователями
├── badges.js         # Система достижений
└── users.js          # Дополнительные пользовательские данные
```

#### PocketBase (`/pocketbase`)
```
pb_migrations/        # Миграции базы данных
pb_hooks/            # Серверные хуки и API
└── pb_public/       # Публичные файлы (изображения бейджей)
```

### Основные команды

```bash
# Разработка
npm run dev              # Запуск в режиме разработки
./start-dev.sh          # Альтернативный запуск

# Производство
npm run build           # Сборка проекта
npm run start           # Запуск в продакшен режиме
npm run stop            # Остановка сервисов

# Разработка отдельных сервисов
cd frontend && npm run dev    # Только frontend
cd backend && npm run dev     # Только backend

# Тестирование
cd frontend && npm test       # Frontend тесты
cd backend && npm test        # Backend тесты
```

## 🔧 Настройка

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# PocketBase
POCKETBASE_URL=http://pocketbase:8080
POCKETBASE_BEARER_TOKEN=your-secret-token
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin12345

# Backend
BACKEND_PORT=3000

# Frontend
FRONTEND_PORT=8080
VITE_BACKEND_URL=http://backend:3000
VITE_POCKETBASE_URL=http://pocketbase:8080

# Development
NODE_ENV=development
```

### Конфигурация платформ

#### VK Mini App
1. Создайте приложение в [VK Developers](https://dev.vk.com/)
2. Настройте Mini App в настройках приложения
3. Укажите URL вашего приложения

#### Telegram Mini App
1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Настройте Mini App через команду `/newapp`
3. Укажите URL вашего приложения

## 🎯 Основные возможности

### Универсальная аутентификация
Приложение автоматически определяет платформу и использует соответствующий метод аутентификации:

```typescript
// Универсальный хук для работы с пользователем
const { user, loading, platform } = useUniversalUser();

// platform будет 'vk' | 'telegram' | 'unknown'
```

### Система бейджей
Готовая система достижений для мотивации пользователей:

```typescript
const { badges, userBadges } = useUserBadges();
```

### Пользовательские данные
Гибкая система для хранения настроек и данных пользователя:

```typescript
// Пример структуры пользовательских данных
interface UserData {
  data_type: 'preferences' | 'settings' | 'progress';
  data_key: string;
  data_value: any;
}
```

## 🧪 Тестирование

### Frontend тесты (Vitest)
```bash
cd frontend
npm test              # Запуск тестов
npm run test:ui       # UI для тестов
npm run test:coverage # Покрытие кода
```

### Backend тесты (Jest)
```bash
cd backend
npm test              # Запуск тестов
```

## 📱 Mock режим

Для разработки без сервера используйте mock режим:

```typescript
// frontend/src/config/mockConfig.ts
export const ENABLE_MOCK_MODE = true; // Включить mock данные
```

## 🎨 Кастомизация

### Добавление новых панелей

1. **Создайте компонент панели**
```tsx
// frontend/src/panels/NewPanel.tsx
export const NewPanel: FC<NavIdProps> = ({ id }) => {
  return (
    <Panel id={id}>
      <PanelHeader>Новая панель</PanelHeader>
      {/* Ваш контент */}
    </Panel>
  );
};
```

2. **Добавьте маршрут**
```typescript
// frontend/src/routes.ts
export const DEFAULT_VIEW_PANELS = {
  // ...существующие панели
  NEW_PANEL: 'new_panel',
};
```

3. **Подключите в App.tsx**
```tsx
import { NewPanel } from './panels/NewPanel';

<View activePanel={activePanel}>
  {/* ...существующие панели */}
  <NewPanel id={DEFAULT_VIEW_PANELS.NEW_PANEL} />
</View>
```

### Добавление новых API endpoints

1. **Backend маршрут**
```javascript
// backend/routes/newRoute.js
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'New endpoint' });
});

export default router;
```

2. **Подключение в index.js**
```javascript
import newRouter from './routes/newRoute.js';
app.use('/api/new', newRouter);
```

### Добавление новых коллекций в PocketBase

1. **Создайте миграцию**
```javascript
// pocketbase/pb_migrations/xxx_create_new_collection.js
migrate((app) => {
  const collection = new Collection({
    name: "new_collection",
    // ... конфигурация
  });
  return app.save(collection);
});
```

## 🚀 Развертывание

### Docker Production

```bash
# Сборка и запуск
docker-compose up --build -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Переменные для продакшена

```env
NODE_ENV=production
POCKETBASE_URL=https://your-domain.com
VITE_BACKEND_URL=https://api.your-domain.com
VITE_POCKETBASE_URL=https://your-domain.com
```

## 📚 Дополнительные ресурсы

- [VKUI Documentation](https://vkcom.github.io/VKUI/)
- [VK Bridge Documentation](https://dev.vk.com/bridge)
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [PocketBase Documentation](https://pocketbase.io/docs/)
- [React Documentation](https://react.dev/)

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для фичи (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## ✨ Благодарности

- [VK Team](https://vk.com/) за VKUI и VK Bridge
- [Telegram](https://telegram.org/) за Mini Apps платформу
- [PocketBase](https://pocketbase.io/) за простую и мощную базу данных
- [React Team](https://react.dev/) за отличный фреймворк
## Maintenance verification (Node 24)

Use Node 24.15+ and `npm ci --ignore-scripts` independently in `frontend` and `backend`.
Frontend: `npm run lint`, `npm run build`, `npm run test:run`.
Backend: `npm test -- --runInBand`. Its test setup blocks external networking, injects only synthetic configuration, and uses the built-in Helvetica font for the isolated PDF transport smoke test. Real Cyrillic PDF rendering still needs a local font (`PDF_FONT_PATH`) or the existing Roboto CDN; it is not proven by this synthetic test.

The maintained stack uses Vite 8 / Vitest 5, React 19, VKUI 8 / Bridge 3, Express 5 / Jest 30 and PocketBase JS 0.28. TypeScript stays on 6.0 because the current typescript-eslint peer range excludes TypeScript 7. Docker installs respect lockfiles and frontend build failures now stop the image build. Supply PocketBase bearer credentials at runtime, never as build arguments.

VK requests now require a valid identity and successful signing on every device and in development. There is no unsigned mobile fallback. Authentication error inspection uses a cloned Response so other errors retain readable bodies. The existing Telegram request contract is kept separate. The template's current platform detector is still hard-coded to VK; this PR does not enable an unverified Telegram production login or introduce automatic mock fallbacks.

Security behavior change: production and an absent `NODE_ENV` always enforce signatures, even if `CHECK_SIGNATURES=false`. Bypass requires both explicit `NODE_ENV=development` (or `test`) and `CHECK_SIGNATURES=false`. Provide `VK_APP_ID` / `VK_SECRET_KEY`; missing configuration returns 503. Signed timestamps must be no older than five minutes or more than 30 seconds in the future. Protected user reads and mutations require verified ownership; failed/missing user lookups and mismatched book ownership never grant access. Debug logs contain no secrets or signatures. Result replay limits, placeholder book loading/download actions and real VK-client behavior still need integration review. Unsupported book navigation is visibly disabled rather than sending users to nonexistent routes.

CI runs only on pull requests with read-only repository permission, no secrets, no database service and no deployment. No PocketBase data or historical migrations are changed. Production/client integration, existing database upgrade behavior and real-client visual smoke tests remain manual gates for this draft. A separate test-only Vite config powers `npm run test:browser`: real Chromium/VKUI at mobile and desktop widths tests signed success, declined signing without a request, retry, and readable error bodies using synthetic local fixtures. Production builds have no mock aliases.

### Telegram compatibility change

Protected Telegram requests now return an explicit 501 before any privileged PocketBase call. The current frontend/API sends only `telegram_user_id` or `telegram-id`, without signed Telegram `initData`; those client-supplied IDs cannot prove identity. Production support requires a separately implemented and verified initData transport/verifier, freshness check and ownership contract. This PR does not claim to implement Telegram authentication, and the existing platform detector remains VK-only. Explicit development/test mode is still available for synthetic fixtures.
