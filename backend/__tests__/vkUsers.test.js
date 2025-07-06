import request from 'supertest';
import nock from 'nock';
import app from '../index.js';
import { POCKETBASE_URL } from '../config.js';

describe('VK Users API', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should get VK user by vkId', async () => {
    const items = [{ id: '1', vk_id: 123 }];
    nock(POCKETBASE_URL)
      .get('/api/collections/vk_users/records')
      .query({ filter: '(vk_id=123)' })
      .reply(200, { items });

    const res = await request(app).get('/api/vk-users/123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(items[0]);
  });

  it('should return null if VK user not found', async () => {
    nock(POCKETBASE_URL)
      .get('/api/collections/vk_users/records')
      .query({ filter: '(vk_id=456)' })
      .reply(200, { items: [] });

    const res = await request(app).get('/api/vk-users/456');
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it('should create a VK user', async () => {
    const user = { vk_id: 789, first_name: 'Test' };
    const created = { id: '2', ...user };
    nock(POCKETBASE_URL)
      .post('/api/collections/vk_users/records', user)
      .reply(200, created);

    const res = await request(app).post('/api/vk-users').send(user);
    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
  });

  it('should update a VK user', async () => {
    const update = { first_name: 'Updated' };
    const updated = { id: '2', vk_id: 789, ...update };
    nock(POCKETBASE_URL)
      .patch('/api/collections/vk_users/records/2', update)
      .reply(200, updated);

    const res = await request(app).put('/api/vk-users/2').send(update);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
  });
});