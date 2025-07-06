import { awardReferralBadge, parseReferralCriteria } from '../utils/badgeAwarder.js';
import nock from 'nock';

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8080";

describe('Referral Badge System', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('parseReferralCriteria', () => {
    it('should parse referral_1 criteria correctly', () => {
      expect(parseReferralCriteria('referral_1')).toBe(1);
    });

    it('should parse referral_5 criteria correctly', () => {
      expect(parseReferralCriteria('referral_5')).toBe(5);
    });

    it('should return null for non-referral criteria', () => {
      expect(parseReferralCriteria('read_10')).toBe(null);
      expect(parseReferralCriteria('registration')).toBe(null);
      expect(parseReferralCriteria('invalid')).toBe(null);
    });

    it('should handle case insensitive criteria', () => {
      expect(parseReferralCriteria('REFERRAL_1')).toBe(1);
      expect(parseReferralCriteria('Referral_3')).toBe(3);
    });
  });

  describe('awardReferralBadge', () => {
    it('should award referral badge to user who has not received it', async () => {
      const userId = 'user123';
      const badgeId = 'badge456';
      
      // Mock finding referral badges
      nock(POCKETBASE_URL)
        .get('/api/collections/badges/records')
        .query(true)  // Матчим любой query string
        .reply(200, {
          items: [
            {
              id: badgeId,
              name: 'Книжный советчик',
              criteria: 'referral_1',
              is_active: true
            }
          ]
        });

      // Mock checking if user already has badge (should not exist)
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_badges/records')
        .query(true)
        .reply(200, { items: [] });

      // Mock creating new badge award
      nock(POCKETBASE_URL)
        .post('/api/collections/vk_user_badges/records')
        .reply(201, {
          id: 'award123',
          vk_user: userId,
          badge: badgeId,
          earned_at: new Date().toISOString()
        });

      const result = await awardReferralBadge(userId);
      expect(result).toBe(true);
    });

    it('should not award duplicate referral badge', async () => {
      const userId = 'user123';
      const badgeId = 'badge456';
      
      // Mock finding referral badges
      nock(POCKETBASE_URL)
        .get('/api/collections/badges/records')
        .query(true)  // Матчим любой query string
        .reply(200, {
          items: [
            {
              id: badgeId,
              name: 'Книжный советчик',
              criteria: 'referral_1',
              is_active: true
            }
          ]
        });

      // Mock checking if user already has badge (should exist)
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_badges/records')
        .query(true)
        .reply(200, { 
          items: [
            {
              id: 'existing123',
              vk_user: userId,
              badge: badgeId
            }
          ] 
        });

      const result = await awardReferralBadge(userId);
      expect(result).toBe(false);
    });

    it('should handle case when no referral badges exist', async () => {
      const userId = 'user123';
      
      // Mock finding no referral badges
      nock(POCKETBASE_URL)
        .get('/api/collections/badges/records')
        .query(true)  // Матчим любой query string
        .reply(200, { items: [] });

      const result = await awardReferralBadge(userId);
      expect(result).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      const userId = 'user123';
      
      // Mock API error
      nock(POCKETBASE_URL)
        .get('/api/collections/badges/records')
        .query(true)  // Матчим любой query string
        .replyWithError('Network error');

      const result = await awardReferralBadge(userId);
      expect(result).toBe(false);
    });
  });
});