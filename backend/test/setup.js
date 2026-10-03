import nock from 'nock';
// Remote APIs are never contacted in tests. Supertest gets loopback only.
nock.disableNetConnect();
nock.enableNetConnect(host => /^(127\.0\.0\.1|localhost):\d+$/.test(host) && !host.endsWith(':8080'));
