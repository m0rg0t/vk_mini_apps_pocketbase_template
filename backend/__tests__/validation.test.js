import { createSafeFilter, sanitizeForPocketBase } from '../utils/validation.js';

describe('Validation Utils', () => {
  describe('sanitizeForPocketBase', () => {
    test('should remove potentially dangerous characters', () => {
      const input = 'test"\';<script>alert("xss")</script>';
      const result = sanitizeForPocketBase(input);
      expect(result).toBe('testscriptalertxssscript');
    });

    test('should preserve safe characters', () => {
      const input = 'valid_name-123 тест';
      const result = sanitizeForPocketBase(input);
      expect(result).toBe('valid_name-123 тест');
    });

    test('should handle non-string input', () => {
      expect(sanitizeForPocketBase(null)).toBe('');
      expect(sanitizeForPocketBase(undefined)).toBe('');
      expect(sanitizeForPocketBase(123)).toBe('');
    });
  });

  describe('createSafeFilter', () => {
    test('should create safe string filter', () => {
      const result = createSafeFilter('name', 'test_user');
      expect(result).toBe('name="test_user"');
    });

    test('should create safe numeric filter', () => {
      const result = createSafeFilter('vk_id', 12345);
      expect(result).toBe('vk_id=12345');
    });

    test('should sanitize string values', () => {
      const result = createSafeFilter('title', 'book"with\'quotes');
      expect(result).toBe('title="bookwithquotes"');
    });

    test('should throw error for invalid field', () => {
      expect(() => {
        createSafeFilter('invalid_field', 'value');
      }).toThrow('Invalid field: invalid_field');
    });

    test('should throw error for invalid operator', () => {
      expect(() => {
        createSafeFilter('id', 'value', 'DROP');
      }).toThrow('Invalid operator: DROP');
    });

    test('should handle different operators', () => {
      expect(createSafeFilter('id', 'test', '!=')).toBe('id!="test"');
      expect(createSafeFilter('vk_id', 123, '>')).toBe('vk_id>123');
    });

    test('should throw error for invalid value type', () => {
      expect(() => {
        createSafeFilter('id', {}, '=');
      }).toThrow('Invalid value type for field id');
    });
  });
});

describe('NoSQL Injection Prevention', () => {
  test('should prevent injection through field names', () => {
    expect(() => {
      createSafeFilter('id"; DROP TABLE users; --', 'test');
    }).toThrow('Invalid field');
  });

  test('should prevent injection through operators', () => {
    expect(() => {
      createSafeFilter('id', 'test', '; DROP TABLE users; --');
    }).toThrow('Invalid operator');
  });

  test('should sanitize malicious values', () => {
    const maliciousValue = 'test"; DROP TABLE users; --';
    const result = createSafeFilter('title', maliciousValue);
    expect(result).toBe('title="test DROP TABLE users --"');
  });

  test('should prevent complex injection attempts', () => {
    const complexInjection = 'test" OR 1=1 OR "a"="a';
    const result = createSafeFilter('title', complexInjection);
    expect(result).toBe('title="test OR 11 OR aa"');
  });
});