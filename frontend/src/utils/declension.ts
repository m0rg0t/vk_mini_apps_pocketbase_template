/**
 * Склонения слов в зависимости от числительного
 */

/**
 * Склоняет слово "бейдж" в зависимости от количества
 * @param count - количество бейджей
 * @returns правильно склоненное слово
 */
export function declineBadge(count: number): string {
  const cases: [string, string, string] = ['бейдж', 'бейджа', 'бейджей'];
  return decline(count, cases);
}

/**
 * Универсальная функция склонения слов
 * @param count - количество
 * @param cases - массив склонений [1, 2-4, 5+]
 * @returns правильно склоненное слово
 */
export function decline(count: number, cases: [string, string, string]): string {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;

  // Исключения для 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return cases[2]; // много (бейджей)
  }

  // Основные правила
  if (lastDigit === 1) {
    return cases[0]; // один (бейдж)
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return cases[1]; // несколько (бейджа)
  } else {
    return cases[2]; // много (бейджей)
  }
}

/**
 * Дополнительные функции склонения для других слов в приложении
 */

/**
 * Склоняет слово "книга" в зависимости от количества
 * @param count - количество книг
 * @returns правильно склоненное слово
 */
export function declineBook(count: number): string {
  const cases: [string, string, string] = ['книга', 'книги', 'книг'];
  return decline(count, cases);
}

/**
 * Склоняет слово "страница" в зависимости от количества
 * @param count - количество страниц
 * @returns правильно склоненное слово
 */
export function declinePage(count: number): string {
  const cases: [string, string, string] = ['страница', 'страницы', 'страниц'];
  return decline(count, cases);
}
