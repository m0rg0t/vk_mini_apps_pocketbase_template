import request from 'supertest';
import nock from 'nock';
import app from '../index.js';
import { POCKETBASE_URL } from '../config.js';

describe('Badges API', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should get all badges', async () => {
    const badges = [{ id: 'b1', name: 'Badge1' }];
    nock(POCKETBASE_URL)
      .get('/api/collections/badges/records')
      .query({ sort: 'sort_order,name' })
      .reply(200, badges);

    const res = await request(app).get('/api/badges');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(badges);
  });
});