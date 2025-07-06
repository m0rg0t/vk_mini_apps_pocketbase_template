# Badge Checker Utility

Утилита для автоматической проверки и выдачи бейджей пользователям на основе их статистики.

## Функции

### `checkEarnedBadges(userId)`

Проверяет, какие бейджи заслуживает пользователь, но еще не получил.

**Параметры:**
- `userId` (string) - ID пользователя в PocketBase

**Возвращает:**
```javascript
{
  user: { /* данные пользователя */ },
  earnedBadges: [ /* массив заслуженных бейджей */ ],
  totalEarned: number
}
```

**Пример использования:**
```javascript
import { checkEarnedBadges } from '../utils/badgeChecker.js';

const result = await checkEarnedBadges('user123');
console.log(`User has earned ${result.totalEarned} new badges`);
```

### `awardEarnedBadges(userId)`

Автоматически выдает все заслуженные бейджи пользователю.

**Параметры:**
- `userId` (string) - ID пользователя в PocketBase

**Возвращает:**
```javascript
{
  success: boolean,
  message: string,
  badgesAwarded: [
    {
      badge: { /* данные бейджа */ },
      result: { /* результат создания связи пользователь-бейдж */ }
    }
  ],
  errors: [ /* массив ошибок, если были */ ]
}
```

**Пример использования:**
```javascript
import { awardEarnedBadges } from '../utils/badgeChecker.js';

const result = await awardEarnedBadges('user123');
if (result.success) {
  console.log(`Successfully awarded ${result.badgesAwarded.length} badges`);
}
```

## Поддерживаемые критерии бейджей

### Структурированные критерии

Утилита поддерживает следующие типы критериев:

1. **`registration`** - Регистрация пользователя
   - Выдается автоматически всем зарегистрированным пользователям

2. **`read_X`** - Прочтение X книг
   - Примеры: `read_1`, `read_10`, `read_50`
   - Проверяется поле `books_read` у пользователя

3. **`streak_X`** - Чтение X дней подряд
   - Примеры: `streak_7`, `streak_30`
   - Проверяется поле `current_streak` у пользователя

4. **`goal_X`** - Достижение X% годовой цели
   - Примеры: `goal_50`, `goal_100`
   - Вычисляется как `(books_read / year_goal) * 100`

5. **`referral_X`** - Приглашение X друзей
   - Примеры: `referral_1`, `referral_5`
   - В настоящее время не реализовано (всегда возвращает false)

## Использование в роутах

### Автоматическая проверка

```javascript
// POST /api/users/:userId/badges (без badge_id)
router.post("/:userId/badges", async (req, res) => {
  if (!req.body.badge_id) {
    const result = await awardEarnedBadges(req.params.userId);
    return res.status(201).json(result);
  }
  // ... ручное присвоение бейджа
});
```

### Проверка без присвоения

```javascript
// GET /api/users/:userId/badges/check
router.get("/:userId/badges/check", async (req, res) => {
  const result = await checkEarnedBadges(req.params.userId);
  return res.json(result);
});
```

## Обработка ошибок

Утилита обрабатывает следующие типы ошибок:

- Ошибки сети при обращении к PocketBase
- Ошибки парсинга JSON
- Ошибки при создании записей бейджей
- Неизвестные критерии бейджей

Все ошибки логируются в консоль и возвращаются в структурированном виде.

## Тестирование

Утилита полностью покрыта тестами в `__tests__/badgeChecker.test.js`.

Запуск тестов:
```bash
npm test badgeChecker
```

## Совместимость

Утилита совместима с существующей системой структурированных критериев бейджей и поддерживает все форматы критериев, определенные в миграции `1687801094_import_badges_data.js`.
