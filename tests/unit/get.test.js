// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('Should receive some form of data in body if populated and added to fragments array', async () => {
    const data = Buffer.from('TestString');

    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments.length).toBe(1);
  });

  test('Using id to get specific fragment', async () => {
    const data = Buffer.from('TestString');

    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    const res1 = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res1.statusCode).toBe(200);
    expect(res1.body.status).toBe('ok');
    expect(Array.isArray(res1.body.fragments)).toBe(true);

    const fragmentId = res1.body.fragments[0];
    const res2 = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1');

    expect(res2.statusCode).toBe(200);

    expect(res2.text).toBe('TestString');
  });

  test('Invalid id to get fragment', async () => {
    const fragmentId = 'invalid';
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });
});
