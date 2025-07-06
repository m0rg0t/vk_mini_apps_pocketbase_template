import request from 'supertest';
import nock from 'nock';
import app from '../index.js';
import { POCKETBASE_URL } from '../config.js';

describe('Health API', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should return backend running and pocketbase hooks status', async () => {
    const pbHealthData = { status: 'ok' };
    nock(POCKETBASE_URL)
      .get('/api/books/health')
      .reply(200, pbHealthData);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      backend: 'running',
      pocketbase_hooks: pbHealthData,
    });
  });
});