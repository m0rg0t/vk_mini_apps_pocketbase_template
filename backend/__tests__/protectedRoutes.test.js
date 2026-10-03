import { jest } from '@jest/globals';
import { createHmac } from 'node:crypto';
import request from 'supertest';
import nock from 'nock';
const base = 'http://127.0.0.1:8080';
jest.unstable_mockModule('../config.js', () => ({
  CHECK_SIGNATURES: true, VK_APP_ID: '42', VK_SECRET_KEY: 'synthetic-secret', POCKETBASE_URL: base, POCKETBASE_BEARER_TOKEN: '',
}));
const { default: app } = await import('../index.js');
function signed(id = 123) {
  const ts = Math.floor(Date.now() / 1000);
  const requestId = Buffer.from(`vk_id_${id}`).toString('base64').replace(/=/g, '');
  const sign = createHmac('sha256', 'synthetic-secret').update(`app_id=42&request_id=${requestId}&ts=${ts}&user_id=${id}`).digest('base64url');
  return { vk_id: id, sign, ts };
}
afterEach(() => nock.cleanAll());
it.each([
  ['get', '/api/users/user1/books', {}], ['get', '/api/users/user1/books/pdf', {}],
  ['get', '/api/users/user1/badges', {}], ['get', '/api/users/user1/badges/check', {}],
  ['get', '/api/users/user1/recommendations', {}], ['post', '/api/users/user1/books', { book_id: 'book1', status: 'reading' }],
  ['post', '/api/users/user1/books/book1', { status: 'reading' }],
  ['put', '/api/users/user1/books/book1', { status: 'reading' }], ['delete', '/api/users/user1/books/book1', {}],
  ['post', '/api/users/user1/badges', { badge_id: 'badge1' }], ['post', '/api/users/user1/award-referral-badge', {}],
  ['put', '/api/vk-users/user1', { first_name: 'Test' }], ['post', '/api/vk-users', { vk_id: 123, first_name: 'Test' }],
])('rejects unsigned %s %s', async (method, url, body) => {
  const res = await request(app)[method](url).send(body);
  expect(res.status).toBe(401);
});
it('updates verified owner and denies a signed different owner', async () => {
  nock(base).get('/api/collections/vk_users/records/user1').reply(200, { vk_id: 123 });
  nock(base).patch('/api/collections/vk_users/records/user1', { first_name: 'Updated' }).reply(200, { id: 'user1', first_name: 'Updated' });
  expect((await request(app).put('/api/vk-users/user1').send({ ...signed(), first_name: 'Updated' })).status).toBe(200);
  nock(base).get('/api/collections/vk_users/records/user1').reply(200, { vk_id: 456 });
  expect((await request(app).put('/api/vk-users/user1').send({ ...signed(), first_name: 'Updated' })).status).toBe(403);
});
it.each([404, 500])('does not mutate on ownership lookup failure %s', async status => {
  nock(base).get('/api/collections/vk_users/records/user1').reply(status, {});
  const forbiddenWrite = nock(base).post('/api/collections/vk_user_books/records').reply(200, {});
  const res = await request(app).post('/api/users/user1/books').send({ ...signed(), book_id: 'book1', status: 'reading' });
  expect(res.status).toBe(status === 404 ? 403 : 503);
  expect(forbiddenWrite.isDone()).toBe(false);
});
it('does not let an owner delete a book belonging to someone else', async () => {
  nock(base).get('/api/collections/vk_users/records/user1').reply(200, { vk_id: 123 });
  nock(base).get('/api/collections/vk_user_books/records/book1').reply(200, { user: 'other-user' });
  const forbiddenWrite = nock(base).delete('/api/collections/vk_user_books/records/book1').reply(200);
  const res = await request(app).delete('/api/users/user1/books/book1').send(signed());
  expect(res.status).toBe(403); expect(forbiddenWrite.isDone()).toBe(false);
});
it('keeps public badges available', async () => {
  nock(base).get('/api/collections/badges/records').query({ sort: 'sort_order,name' }).reply(200, { items: [] });
  expect((await request(app).get('/api/badges')).status).toBe(200);
});
it('rejects Telegram client IDs before any privileged request', async () => {
  const forbiddenWrite = nock(base).post('/api/collections/vk_users/records').reply(200, {});
  const res = await request(app).post('/api/vk-users').send({ telegram_user_id: 123, first_name: 'Test' });
  expect(res.status).toBe(501); expect(forbiddenWrite.isDone()).toBe(false);
});
it('cannot override owner or persist signed credentials in book creation/update', async () => {
  nock(base).get('/api/collections/vk_users/records/user1').reply(200, { vk_id: 123 });
  nock(base).get('/api/collections/vk_user_books/records').query({ filter: '(user="user1" && book_id="book1")' }).reply(200, { items: [] });
  const create = nock(base).post('/api/collections/vk_user_books/records', { user: 'user1', book_id: 'book1', status: 'reading' }).reply(200, { id: 'record1' });
  expect((await request(app).post('/api/users/user1/books').send({ ...signed(), user: 'other-user', book_id: 'book1', status: 'reading' })).status).toBe(201);
  expect(create.isDone()).toBe(true);
  nock(base).get('/api/collections/vk_users/records/user1').reply(200, { vk_id: 123 });
  nock(base).get('/api/collections/vk_user_books/records/record1').reply(200, { user: 'user1' });
  const update = nock(base).patch('/api/collections/vk_user_books/records/record1', { status: 'reading' }).reply(200, { id: 'record1' });
  expect((await request(app).put('/api/users/user1/books/record1').send({ ...signed(), user: 'other-user', book_id: 'other-book', status: 'reading' })).status).toBe(200);
  expect(update.isDone()).toBe(true);
});
