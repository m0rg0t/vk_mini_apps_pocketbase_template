/**
 * Простые тесты для проверки системы критериев бейджей
 */

import { 
  createBadgeCriteria, 
  parseBadgeCriteria, 
  getBadgeCriteriaDescription,
  BADGE_CRITERIA_PRESETS,
  isValidBadgeCriteria 
} from './badgeCriteria';

// Простая функция для тестирования
function test(description: string, condition: boolean) {
  console.log(`${condition ? '✅' : '❌'} ${description}`);
  return condition;
}

console.log('🧪 Запуск тестов системы критериев бейджей...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(description: string, condition: boolean) {
  totalTests++;
  if (test(description, condition)) {
    passedTests++;
  }
}

// Тесты создания критериев
console.log('📝 Тесты создания критериев:');
runTest(
  'Создание критерия для чтения книг',
  createBadgeCriteria({ type: 'books_read', value: 10 }) === 'read_10'
);

runTest(
  'Создание критерия регистрации',
  createBadgeCriteria({ type: 'registration', value: 1 }) === 'registration'
);

runTest(
  'Создание критерия приглашений',
  createBadgeCriteria({ type: 'referral', value: 3 }) === 'referral_3'
);

// Тесты парсинга
console.log('\n🔍 Тесты парсинга критериев:');
const readParsed = parseBadgeCriteria('read_25');
runTest(
  'Парсинг read_25',
  readParsed?.type === 'books_read' && readParsed?.value === 25
);

const regParsed = parseBadgeCriteria('registration');
runTest(
  'Парсинг registration',
  regParsed?.type === 'registration' && regParsed?.value === 1
);

runTest(
  'Парсинг невалидного критерия',
  parseBadgeCriteria('invalid_criteria') === null
);

// Тесты валидации
console.log('\n✅ Тесты валидации:');
runTest(
  'Валидация правильного критерия',
  isValidBadgeCriteria('read_10') === true
);

runTest(
  'Валидация неправильного критерия',
  isValidBadgeCriteria('invalid') === false
);

// Тесты описаний
console.log('\n📖 Тесты описаний:');
runTest(
  'Описание registration',
  getBadgeCriteriaDescription('registration') === 'Регистрация в приложении'
);

runTest(
  'Описание read_1',
  getBadgeCriteriaDescription('read_1') === 'Прочтение первой книги'
);

runTest(
  'Описание read_10',
  getBadgeCriteriaDescription('read_10') === 'Прочтение 10 книг'
);

// Тесты пресетов
console.log('\n🎯 Тесты пресетов:');
runTest(
  'Пресет регистрации',
  BADGE_CRITERIA_PRESETS.REGISTRATION === 'registration'
);

runTest(
  'Пресет первой книги',
  BADGE_CRITERIA_PRESETS.FIRST_BOOK === 'read_1'
);

runTest(
  'Пресет 10 книг',
  BADGE_CRITERIA_PRESETS.BOOKS_10 === 'read_10'
);

// Результаты тестов
console.log(`\n📊 Результаты тестов: ${passedTests}/${totalTests} пройдено`);

if (passedTests === totalTests) {
  console.log('🎉 Все тесты прошли успешно!');
} else {
  console.log(`❌ Провалено тестов: ${totalTests - passedTests}`);
}

export {}; // Делаем файл модулем
