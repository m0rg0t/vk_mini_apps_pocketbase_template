import request from 'supertest';
import nock from 'nock';
import app from '../index.js';
import { POCKETBASE_URL } from '../config.js';

describe('Users API', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('User Books endpoints', () => {
    it('should get user books', async () => {
      const items = [{ id: 'ub1' }];
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_books/records')
        .query({ filter: '(user="user1")', expand: 'book_id', sort: '-created' })
        .reply(200, { items });

      const res = await request(app).get('/api/users/user1/books');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ items });
    });

    it('should add book to user library', async () => {
      const body = { book_id: 'b1', status: 'reading' };
      const created = { id: 'ub2', user: 'user1', ...body };
      nock(POCKETBASE_URL)
        .post('/api/collections/vk_user_books/records', (reqBody) => reqBody.user === 'user1')
        .reply(200, created);

      const res = await request(app).post('/api/users/user1/books').send(body);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
    });

    it('should upsert (update) an existing user book', async () => {
      const filter = '(user="user1" && book_id="b1")';
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_books/records')
        .query({ filter })
        .reply(200, { items: [{ id: 'ub3' }] });
      nock(POCKETBASE_URL)
        .patch('/api/collections/vk_user_books/records/ub3')
        .reply(200, { id: 'ub3', status: 'completed' });

      const res = await request(app)
        .post('/api/users/user1/books/b1')
        .send({ status: 'completed' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 'ub3', status: 'completed' });
    });

    it('should upsert (create) a new user book when none exists', async () => {
      const filter = '(user="user1" && book_id="b2")';
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_books/records')
        .query({ filter })
        .reply(200, { items: [] });
      const payload = { status: 'reading', started_reading: '2024-01-01T00:00:00Z' };
      const created = { id: 'ub4', user: 'user1', book_id: 'b2', ...payload };
      nock(POCKETBASE_URL)
        .post('/api/collections/vk_user_books/records', (reqBody) => reqBody.book_id === 'b2')
        .reply(200, created);

      const res = await request(app)
        .post('/api/users/user1/books/b2')
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
    });

    it('should update user book status', async () => {
      const payload = { status: 'completed' };
      const updated = { id: 'ub5', status: 'completed' };
      nock(POCKETBASE_URL)
        .patch('/api/collections/vk_user_books/records/ub5', payload)
        .reply(200, updated);

      const res = await request(app)
        .put('/api/users/user1/books/ub5')
        .send(payload);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
    });

    it('should delete user book', async () => {
      nock(POCKETBASE_URL)
        .delete('/api/collections/vk_user_books/records/ub6')
        .reply(200);

      const res = await request(app).delete('/api/users/user1/books/ub6');
      expect(res.status).toBe(204);
    });

    it('should generate pdf of user books', async () => {
      const items = [{
        id: 'ub7',
        review: 'Nice',
        finished_reading: '2024-01-01T00:00:00Z',
        expand: { book_id: { title: 'B', description: 'D' } }
      }];
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_books/records')
        .query({ filter: '(vk_user_id="user1")', expand: 'book_id', sort: '-finished_reading' })
        .reply(200, { items });

      const res = await request(app).get('/api/users/user1/books/pdf');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body).toBeInstanceOf(Buffer);
    });
  });

  describe('User Badges endpoints', () => {
    it('should get user badges', async () => {
      const items = [{ id: 'cb1' }];
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_badges/records')
        .query({ filter: '(vk_user_id="user1")', expand: 'badge_id', sort: '-earned_at' })
        .reply(200, { items });

      const res = await request(app).get('/api/users/user1/badges');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ items });
    });

    it('should award a badge to user', async () => {
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_badges/records')
        .query({ filter: '(vk_user_id="user1" && badge_id="badge1")' })
        .reply(200, { items: [] });
      const badgeData = { badge_id: 'badge1' };
      const reply = { id: 'ubg1', vk_user_id: 'user1', ...badgeData };
      nock(POCKETBASE_URL)
        .post('/api/collections/vk_user_badges/records', (reqBody) => reqBody.badge_id === 'badge1')
        .reply(200, reply);

      const res = await request(app)
        .post('/api/users/user1/badges')
        .send(badgeData);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(reply);
    });    it('should not award duplicate badge', async () => {
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_badges/records')
        .query({ filter: '(vk_user_id="user1" && badge_id="badge1")' })
        .reply(200, { items: [{ id: 'ubg1' }] });
      const res = await request(app)
        .post('/api/users/user1/badges')
        .send({ badge_id: 'badge1' });
      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: 'User already has this badge' });
    });

    it('should auto-award earned badges when no badge_id provided', async () => {
      const userData = { id: 'user1', books_read: 10, current_streak: 5, year_goal: 20 };
      const badges = [
        { id: 'badge1', name: 'First Book', criteria: 'read_1', is_active: true },
        { id: 'badge2', name: '10 Books', criteria: 'read_10', is_active: true }
      ];
      
      // Mock checking earned badges
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_users/records/user1')
        .reply(200, userData);
      nock(POCKETBASE_URL)
        .get('/api/collections/badges/records')
        .query({ filter: '(is_active=true)', sort: 'sort_order,name' })
        .reply(200, { items: badges });
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_badges/records')
        .query({ filter: '(vk_user_id="user1")' })
        .reply(200, { items: [] });
      
      // Mock awarding badges
      nock(POCKETBASE_URL)
        .post('/api/collections/vk_user_badges/records')
        .reply(200, { id: 'ub1', vk_user_id: 'user1', badge_id: 'badge1' });
      nock(POCKETBASE_URL)
        .post('/api/collections/vk_user_badges/records')
        .reply(200, { id: 'ub2', vk_user_id: 'user1', badge_id: 'badge2' });

      const res = await request(app)
        .post('/api/users/user1/badges')
        .send({}); // No badge_id triggers auto-check
      
      expect(res.status).toBe(201);
      expect(res.body.badgesAwarded).toHaveLength(2);
    });

    it('should check earned badges without awarding them', async () => {
      const userData = { id: 'user1', books_read: 5, current_streak: 2, year_goal: 20 };
      const badges = [
        { id: 'badge1', name: 'First Book', criteria: 'read_1', is_active: true },
        { id: 'badge2', name: '10 Books', criteria: 'read_10', is_active: true }
      ];
      
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_users/records/user1')
        .reply(200, userData);
      nock(POCKETBASE_URL)
        .get('/api/collections/badges/records')
        .query({ filter: '(is_active=true)', sort: 'sort_order,name' })
        .reply(200, { items: badges });
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_badges/records')
        .query({ filter: '(vk_user_id="user1")' })
        .reply(200, { items: [] });

      const res = await request(app).get('/api/users/user1/badges/check');
      
      expect(res.status).toBe(200);
      expect(res.body.totalEarned).toBe(1); // Only read_1, not read_10
      expect(res.body.earnedBadges[0].criteria).toBe('read_1');
    });
  });

  // describe('User Stats endpoints', () => {
  //   it('should get user stats', async () => {
  //     const userData = { id: 'user1', year_goal: 10, current_streak: 2 };
  //     nock(POCKETBASE_URL)
  //       .get('/api/collections/vk_users/records/user1')
  //       .reply(200, userData);
  //     const currentYear = new Date().getFullYear();
  //     nock(POCKETBASE_URL)
  //       .get('/api/collections/vk_user_books/records')
  //       .query({ filter: `(vk_user_id="user1" && status="completed" && finished_reading >= "${currentYear}-01-01")` })
  //       .reply(200, { items: [1, 2, 3] });
  //     nock(POCKETBASE_URL)
  //       .get('/api/collections/vk_user_badges/records')
  //       .query({ filter: '(vk_user_id="user1")' })
  //       .reply(200, { items: [1] });

  //     const res = await request(app).get('/api/users/user1/stats');
  //     expect(res.status).toBe(200);
  //     expect(res.body).toEqual({
  //       user: userData,
  //       books_read_this_year: 3,
  //       year_goal: 10,
  //       current_streak: 2,
  //       badges_count: 1,
  //       progress_percentage: Math.round((3 / 10) * 100),
  //     });
  //   });

  //   it('should update user stats for book_completed action', async () => {
  //     const userData = { books_read: 5, current_streak: 1 };
  //     nock(POCKETBASE_URL)
  //       .get('/api/collections/vk_users/records/user1')
  //       .reply(200, userData);
  //     const updated = { ...userData, books_read: 6, current_streak: 2 };
  //     nock(POCKETBASE_URL)
  //       .patch('/api/collections/vk_users/records/user1')
  //       .reply(200, updated);
  //     const res = await request(app)
  //       .post('/api/users/user1/update-stats')
  //       .send({ action: 'book_completed' });
  //     expect(res.status).toBe(200);
  //     expect(res.body).toEqual({ message: 'User stats updated successfully', user: updated, action: 'book_completed' });
  //   });

  //   it('should reset user streak for streak_reset action', async () => {
  //     const userData = { current_streak: 5 };
  //     nock(POCKETBASE_URL)
  //       .get('/api/collections/vk_users/records/user1')
  //       .reply(200, userData);
  //     const updated = { ...userData, current_streak: 0 };
  //     nock(POCKETBASE_URL)
  //       .patch('/api/collections/vk_users/records/user1')
  //       .reply(200, updated);
  //     const res = await request(app)
  //       .post('/api/users/user1/update-stats')
  //       .send({ action: 'streak_reset' });
  //     expect(res.status).toBe(200);
  //     expect(res.body).toEqual({ message: 'User stats updated successfully', user: updated, action: 'streak_reset' });
  //   });
  // });

  describe('Personalized Recommendations via Users API', () => {
    it('should get personalized user recommendations', async () => {
      const userBooks = { items: [{ book_id: 'b1' }] };
      nock(POCKETBASE_URL)
        .get('/api/collections/vk_user_books/records')
        .query(true)
        .reply(200, userBooks);
      const recBooks = { items: [{ id: 'b2' }] };
      nock(POCKETBASE_URL)
        .get('/api/collections/books/records')
        .query(true)
        .reply(200, recBooks);
      const res = await request(app).get('/api/users/user1/recommendations');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        user_id: 'user1',
        type: 'personalized',
        books: recBooks.items,
        generated_at: expect.any(String),
        total_books_read: 1,
      });
    });
  });
});