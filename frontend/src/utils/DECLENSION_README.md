# Утилиты склонения

В директории `/src/utils/declension.ts` находятся утилиты для правильного склонения русских слов в зависимости от числительного.

## Доступные функции

### `declineBadge(count: number): string`
Склоняет слово "бейдж" в зависимости от количества.

**Примеры:**
- `declineBadge(1)` → `"бейдж"`
- `declineBadge(2)` → `"бейджа"`
- `declineBadge(5)` → `"бейджей"`
- `declineBadge(11)` → `"бейджей"`
- `declineBadge(21)` → `"бейдж"`

### `declineBook(count: number): string`
Склоняет слово "книга" в зависимости от количества.

**Примеры:**
- `declineBook(1)` → `"книга"`
- `declineBook(2)` → `"книги"`
- `declineBook(5)` → `"книг"`

### `declinePage(count: number): string`
Склоняет слово "страница" в зависимости от количества.

**Примеры:**
- `declinePage(1)` → `"страница"`
- `declinePage(2)` → `"страницы"`
- `declinePage(5)` → `"страниц"`

### `decline(count: number, cases: [string, string, string]): string`
Универсальная функция склонения для любых слов.

**Параметры:**
- `count` - количество
- `cases` - массив склонений в формате `[1, 2-4, 5+]`

**Пример:**
```typescript
decline(5, ['товар', 'товара', 'товаров']) // → "товаров"
```

## Правила склонения

Функции используют стандартные правила русского языка:

1. **Единственное число (1)**: для чисел, оканчивающихся на 1, кроме 11
2. **Двойственное число (2-4)**: для чисел, оканчивающихся на 2, 3, 4, кроме 12, 13, 14
3. **Множественное число (5+)**: для всех остальных случаев, включая 0

## Использование в компонентах

```typescript
import { declineBadge } from '../utils/declension';

// В компоненте
const badgeCount = userBadges?.length || 0;
return (
  <Text>
    {badgeCount} {declineBadge(badgeCount)}
  </Text>
);
```
