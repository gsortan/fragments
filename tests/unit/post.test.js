// tests/unit/get.test.js

const request = require('supertest');
const hash = require('../../src/hash');

const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('Unsupported content type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'audio/mpeg');

    expect(res.statusCode).toBe(415);
  });

  test('authenticated user successfully creates plain text fragment', async () => {
    const data = Buffer.from('TestString');

    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    parsedRes = JSON.parse(res.text);

    expect(res.status).toBe(201);
    expect(parsedRes.status).toBe('ok');
    expect(parsedRes.fragment).toHaveProperty('id');
    expect(parsedRes.fragment).toHaveProperty('ownerId');
    expect(parsedRes.fragment).toHaveProperty('created');
    expect(parsedRes.fragment).toHaveProperty('updated');
    expect(parsedRes.fragment).toHaveProperty('type');
    expect(parsedRes.fragment).toHaveProperty('size');
    expect(parsedRes.fragment.ownerId).toEqual(hash('user1@email.com'));
    expect(parsedRes.fragment.size).toBe(10);
    expect(parsedRes.fragment.type).toBe('text/plain');
  });

  test('500 error for invalid media type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'invalid')
      .send(Buffer.from('TestString'));

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe('invalid media type');
  });
});
