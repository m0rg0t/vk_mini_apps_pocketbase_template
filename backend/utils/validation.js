import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware для обработки результатов валидации
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Валидация ID параметров (должны быть строками из букв, цифр, подчеркиваний)
 */
export const validateId = (fieldName = 'id') => [
  param(fieldName)
    .isString()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .isLength({ min: 1, max: 50 })
    .withMessage(`${fieldName} must be a valid alphanumeric string`)
];

/**
 * Валидация VK ID (должен быть положительным числом)
 */
export const validateVkId = () => [
  param('vkId')
    .isInt({ min: 1 })
    .withMessage('VK ID must be a positive integer')
];

/**
 * Валидация Telegram ID (должен быть положительным числом)
 */
export const validateTelegramId = () => [
  query('telegram-id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Telegram ID must be a positive integer')
];

/**
 * Валидация данных пользователя для создания/обновления
 */
export const validateUserData = () => [
  body('first_name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/)
    .withMessage('First name must be a valid name with letters, spaces, and hyphens only'),
  
  body('last_name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/)
    .withMessage('Last name must be a valid name with letters, spaces, and hyphens only'),
  
  body('photo_url')
    .optional()
    .isURL()
    .withMessage('Photo URL must be a valid URL'),
  
  body('vk_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('VK ID must be a positive integer'),
  
  body('telegram_user_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Telegram user ID must be a positive integer'),
  
  body('books_read')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Books read must be a non-negative integer'),
  
  body('current_streak')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current streak must be a non-negative integer'),
  
  body('year_goal')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Year goal must be between 1 and 1000'),
  
  body('sign')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Sign must be a valid string'),
  
  body('ts')
    .optional()
    // .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Timestamp must be a valid string')
];

/**
 * Валидация данных книги
 */
export const validateBookData = () => [
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters'),
  
  body('author')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Author must be between 1 and 200 characters'),
  
  body('isbn')
    .optional()
    .isString()
    .matches(/^[0-9-]+$/)
    .withMessage('ISBN must contain only numbers and hyphens'),
  
  body('pages')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Pages must be between 1 and 10000'),
  
  body('rating')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  body('review')
    .optional()
    .isString()
    .trim()
    .customSanitizer(value => {
      return typeof value === 'string' ? value.substring(0, 2048) : value;
    })
    .isLength({ max: 2048 })
    .withMessage('Review must not exceed 2048 characters')
];

/**
 * Валидация поисковых запросов
 */
export const validateSearchQuery = () => [
  query('q')
    .optional()
    .isString()
    .trim()
    .customSanitizer(value => {
      return typeof value === 'string' ? value.substring(0, 500) : value;
    })
    .isLength({ min: 1, max: 500 })
    .matches(/^[a-zA-Zа-яА-ЯёЁ0-9\s\-.,!?'"«»():;\/\\&%@#+*=<>_№~`]+$/)
    .withMessage('Search query contains invalid characters or is longer than 500 characters'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
];

/**
 * Валидация query параметров для фильтрации пользователей
 */
export const validateUserFilters = () => [
  query('vk_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('VK ID must be a positive integer'),
  
  query('telegram-id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Telegram ID must be a positive integer')
];

/**
 * Валидация book ID в параметрах
 */
export const validateBookId = () => validateId('bookId');

/**
 * Валидация user ID в параметрах
 */
export const validateUserId = () => validateId('userId');

/**
 * Валидация badge ID в параметрах
 */
export const validateBadgeId = () => validateId('badgeId');

/**
 * Санитизация строки для использования в PocketBase фильтрах
 * Удаляет потенциально опасные символы для предотвращения injection
 */
export const sanitizeForPocketBase = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  
  // Удаляем все символы кроме букв, цифр, пробелов, дефисов и подчеркиваний
  return str.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s\-_]/g, '').trim();
};

/**
 * Создание безопасного фильтра для PocketBase
 */
export const createSafeFilter = (field, value, operator = '=') => {
  const allowedOperators = ['=', '!=', '>', '<', '>=', '<=', '~', '!~'];
  const allowedFields = [
    'id', 'vk_id', 'telegram_user_id', 'first_name', 'last_name', 
    'title', 'author', 'user', 'book', 'badge', 'isbn', 'name', 'book_id'
  ];
  
  if (!allowedOperators.includes(operator)) {
    throw new Error(`Invalid operator: ${operator}`);
  }
  
  if (!allowedFields.includes(field)) {
    throw new Error(`Invalid field: ${field}`);
  }
  
  // Для строковых значений добавляем кавычки и санитизируем
  if (typeof value === 'string') {
    const sanitizedValue = sanitizeForPocketBase(value);
    return `${field}${operator}"${sanitizedValue}"`;
  }
  
  // Для числовых значений проверяем, что это действительно число
  if (typeof value === 'number' && !isNaN(value)) {
    return `${field}${operator}${value}`;
  }
  
  throw new Error(`Invalid value type for field ${field}`);
};