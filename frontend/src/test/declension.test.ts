import { declineBadge, declineBook, declinePage, decline } from '../utils/declension';

describe('declension utilities', () => {
  describe('declineBadge', () => {
    test('should decline "бейдж" correctly', () => {
      expect(declineBadge(0)).toBe('бейджей');
      expect(declineBadge(1)).toBe('бейдж');
      expect(declineBadge(2)).toBe('бейджа');
      expect(declineBadge(3)).toBe('бейджа');
      expect(declineBadge(4)).toBe('бейджа');
      expect(declineBadge(5)).toBe('бейджей');
      expect(declineBadge(10)).toBe('бейджей');
      expect(declineBadge(11)).toBe('бейджей');
      expect(declineBadge(12)).toBe('бейджей');
      expect(declineBadge(13)).toBe('бейджей');
      expect(declineBadge(14)).toBe('бейджей');
      expect(declineBadge(21)).toBe('бейдж');
      expect(declineBadge(22)).toBe('бейджа');
      expect(declineBadge(25)).toBe('бейджей');
      expect(declineBadge(101)).toBe('бейдж');
      expect(declineBadge(102)).toBe('бейджа');
      expect(declineBadge(105)).toBe('бейджей');
    });
  });

  describe('declineBook', () => {
    test('should decline "книга" correctly', () => {
      expect(declineBook(1)).toBe('книга');
      expect(declineBook(2)).toBe('книги');
      expect(declineBook(5)).toBe('книг');
      expect(declineBook(11)).toBe('книг');
      expect(declineBook(21)).toBe('книга');
    });
  });

  describe('declinePage', () => {
    test('should decline "страница" correctly', () => {
      expect(declinePage(1)).toBe('страница');
      expect(declinePage(2)).toBe('страницы');
      expect(declinePage(5)).toBe('страниц');
      expect(declinePage(11)).toBe('страниц');
      expect(declinePage(21)).toBe('страница');
    });
  });

  describe('decline', () => {
    test('should handle negative numbers', () => {
      expect(decline(-1, ['item', 'items', 'items'])).toBe('item');
      expect(decline(-2, ['item', 'items', 'items'])).toBe('items');
      expect(decline(-5, ['item', 'items', 'items'])).toBe('items');
    });

    test('should handle edge cases for teens (11-14)', () => {
      expect(decline(11, ['item', 'items', 'many'])).toBe('many');
      expect(decline(12, ['item', 'items', 'many'])).toBe('many');
      expect(decline(13, ['item', 'items', 'many'])).toBe('many');
      expect(decline(14, ['item', 'items', 'many'])).toBe('many');
      expect(decline(111, ['item', 'items', 'many'])).toBe('many');
      expect(decline(112, ['item', 'items', 'many'])).toBe('many');
      expect(decline(113, ['item', 'items', 'many'])).toBe('many');
      expect(decline(114, ['item', 'items', 'many'])).toBe('many');
    });
  });
});
