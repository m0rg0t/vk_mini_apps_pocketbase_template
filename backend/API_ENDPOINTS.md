# Backend API Endpoints Documentation

## Обзор добавленных API endpoints

Для полноценной работы фронтенда были добавлены следующие группы API endpoints:

## 1. VK Users API

### GET `/api/vk-users/:vkId`
Получение пользователя по VK ID
- **Параметры**: `vkId` - VK ID пользователя
- **Ответ**: Объект пользователя или `null` если не найден

### POST `/api/vk-users`
Создание нового VK пользователя
- **Тело запроса**: 
```json
{
  "vk_id": 123456,
  "first_name": "Иван",
  "last_name": "Иванов",
  "year_goal": 50
}
```

### PUT `/api/vk-users/:id`
Обновление данных пользователя
- **Параметры**: `id` - ID пользователя в PocketBase
- **Тело запроса**: Поля для обновления

## 2. User Books API

### GET `/api/users/:userId/books`
Получение книг пользователя
- **Параметры**: `userId` - ID пользователя
- **Ответ**: Список книг с развернутой информацией

### POST `/api/users/:userId/books`
Добавление книги в библиотеку пользователя
- **Тело запроса**:
```json
{
  "book_id": "book123",
  "status": "reading", // или "completed"
  "started_reading": "2024-01-15T10:00:00Z"
}
```

### POST `/api/users/:userId/books/:bookId`
Добавление или изменение статуса книги в библиотеке пользователя
- **Параметры**: `userId` - ID пользователя, `bookId` - ID книги
- **Тело запроса**:
```json
{
  "status": "reading", // или "completed"
  "started_reading": "2024-01-15T10:00:00Z", // опционально при создании
  "finished_reading": "2024-01-20T15:30:00Z", // опционально при завершении
  "rating": 5, // опционально
  "review": "Отличная книга!" // опционально
}
```
- **Ответ**: Объект vk_user_books (новая или обновленная запись)

### PUT `/api/users/:userId/books/:userBookId`
Обновление статуса чтения/рейтинга книги
- **Тело запроса**:
```json
{
  "status": "completed",
  "finished_reading": "2024-01-20T15:30:00Z",
  "rating": 5,
  "review": "Отличная книга!"
}
```

### DELETE `/api/users/:userId/books/:userBookId`
Удаление книги из библиотеки пользователя

### GET `/api/users/:userId/books/pdf`
Генерация PDF со списком книг пользователя
- **Параметры**: `userId` - ID пользователя
- **Ответ**: PDF-файл со списком прочитанных книг пользователя с указанием названия, описания, рейтинга и отзыва

## 3. Badges API

### GET `/api/badges`
Получение всех доступных наград
- **Ответ**: Список наград, отсортированный по `sort_order` и `name`

### GET `/api/users/:userId/badges`
Получение наград пользователя
- **Ответ**: Список наград пользователя с развернутой информацией о наградах

### POST `/api/users/:userId/badges`
Присвоение награды пользователю или автоматическая проверка и выдача заслуженных бейджей

**Вариант 1: Ручное присвоение конкретного бейджа**
- **Тело запроса**:
```json
{
  "badge_id": "badge123"
}
```
- **Статус 409**: Если у пользователя уже есть эта награда
- **Ответ**: Данные созданной связи пользователь-бейдж

**Вариант 2: Автоматическая проверка и выдача заслуженных бейджей**
- **Тело запроса**: `{}` (пустой объект или без `badge_id`)
- **Ответ**:
```json
{
  "message": "Awarded 2 badges",
  "badgesAwarded": [
    {
      "badge": { /* данные бейджа */ },
      "userBadge": { /* данные связи пользователь-бейдж */ }
    }
  ]
}
```

### GET `/api/users/:userId/badges/check`
Проверка каких бейджей заслуживает пользователь (без их присвоения)
- **Ответ**:
```json
{
  "user": { /* данные пользователя */ },
  "earnedBadges": [ /* массив заслуженных бейджей */ ],
  "totalEarned": 2,
  "message": "User has earned 2 new badge(s)"
}
```

## 4. Statistics API

### GET `/api/users/:userId/stats`
Получение статистики пользователя
- **Ответ**:
```json
{
  "user": { /* данные пользователя */ },
  "books_read_this_year": 15,
  "year_goal": 50,
  "current_streak": 7,
  "badges_count": 8,
  "progress_percentage": 30
}
```

### POST `/api/users/:userId/update-stats`
Обновление статистики после действий пользователя
- **Тело запроса**:
```json
{
  "action": "book_completed", // или "streak_reset"
  "book_id": "book123" // опционально
}
```

## Frontend Hooks

Для работы с новыми API созданы следующие hooks:

### useBackendVKUser(vkId)
Работа с VK пользователями через Backend API

### useBackendUserBooks(userId)
Управление библиотекой книг пользователя

### useBackendBadges(userId)
Работа с наградами (получение всех наград и наград пользователя)

### useUserStats(userId)
Получение и обновление статистики пользователя