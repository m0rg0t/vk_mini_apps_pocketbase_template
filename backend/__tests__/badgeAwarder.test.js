import nock from 'nock';
import { awardBadge, checkReadBadges, awardRegistrationBadge } from '../utils/badgeAwarder.js';
import { POCKETBASE_URL } from '../config.js';

describe('Badge Awarder', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('awardBadge', () => {
    it('should award a new badge to user', async () => {
      const userId = 'user123';
      const badgeId = 'badge456';

      // Mock check for existing badge (not found)
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_badges/records')
        .query({ filter: `(vk_user="${userId}" && badge="${badgeId}")` })
        .reply(200, { items: [] });

      // Mock creating new badge award
      nock(POCKETBASE_URL)
        .post('/api/collections/vk_user_badges/records')
        .reply(200, { id: 'award123', vk_user: userId, badge: badgeId });

      const result = await awardBadge(userId, badgeId);
      expect(result).toBe(true);
    });

    it('should not award duplicate badge', async () => {
      const userId = 'user123';
      const badgeId = 'badge456';

      // Mock check for existing badge (found)
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_badges/records')
        .query({ filter: `(vk_user="${userId}" && badge="${badgeId}")` })
        .reply(200, { items: [{ id: 'existing123' }] });

      const result = await awardBadge(userId, badgeId);
      expect(result).toBe(false);
    });
  });
  describe('checkReadBadges', () => {
    it('should award badges based on completed books count', async () => {
      const userId = 'user123';

      // Mock books count - используем правильный формат URL-кодирования
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_books/records')
        .query(true) // Принимаем любые query параметры
        .reply(200, { totalItems: 5 });

      // Mock badges
      nock(POCKETBASE_URL)
        .get('/api/collections/badges/records')
        .query(true) // Принимаем любые query параметры
        .reply(200, {
          items: [
            { id: 'badge1', criteria: 'read_3' },
            { id: 'badge2', criteria: 'read_5' },
            { id: 'badge3', criteria: 'read_10' }
          ]
        });

      // Mock checking existing badges - принимаем любые параметры
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_badges/records')
        .query(true)
        .reply(200, { items: [] })
        .persist(); // Используем persist чтобы мок работал для множественных запросов

      // Mock awarding badges
      nock(POCKETBASE_URL)
        .post('/api/collections/vk_user_badges/records')
        .reply(200, { id: 'award1' })
        .persist();

      const result = await checkReadBadges(userId);
      expect(result).toBe(2); // Should award 2 badges (read_3 and read_5)
    });
  });
  describe('awardRegistrationBadge', () => {
    it('should award registration badge to new user', async () => {
      const userId = 'user123';

      // Mock finding registration badge
      nock(POCKETBASE_URL)
        .get('/api/collections/badges/records')
        .query(true) // Принимаем любые query параметры
        .reply(200, { items: [{ id: 'reg_badge', criteria: 'registration' }] });

      // Mock check for existing badge (not found)
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_badges/records')
        .query(true) // Принимаем любые query параметры
        .reply(200, { items: [] });

      // Mock creating badge award
      nock(POCKETBASE_URL)
        .post('/api/collections/vk_user_badges/records')
        .reply(200, { id: 'award123' });

      const result = await awardRegistrationBadge(userId);
      expect(result).toBe(true);
    });

    it('should return false if no registration badge found', async () => {
      const userId = 'user123';

      // Mock finding registration badge (not found)
      nock(POCKETBASE_URL)
        .get('/api/collections/badges/records')
        .query(true) // Принимаем любые query параметры
        .reply(200, { items: [] });

      const result = await awardRegistrationBadge(userId);
      expect(result).toBe(false);
    });
  });
});
