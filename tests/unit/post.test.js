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

    // Use res.body instead of JSON.parse(res.text)
    expect(res.body.status).toBe('ok');
    expect(res.statusCode).toBe(201);
    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment).toHaveProperty('ownerId');
    expect(res.body.fragment).toHaveProperty('created');
    expect(res.body.fragment).toHaveProperty('updated');
    expect(res.body.fragment).toHaveProperty('type');
    expect(res.body.fragment).toHaveProperty('size');

    // Validate owner ID and size
    expect(res.body.fragment.ownerId).toEqual(hash('user1@email.com'));
    expect(res.body.fragment.size).toBe(Buffer.byteLength(data));

    // Validate Content-Type
    expect(res.body.fragment.type).toBe('text/plain');
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
