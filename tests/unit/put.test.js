// tests/unit/put.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments', () => {
  const auth = ['user1@email.com', 'password1'];
  const updatedData = 'Update Test';

  test('returns 404 for non-existent fragment', async () => {
    const res = await request(app)
      .put('/v1/fragments/not-exist')
      .auth(...auth)
      .set('Content-Type', 'text/plain')
      .send('Test');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('returns 400 on Content-Type mismatch', async () => {
    const data = Buffer.from('TestString');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    const id = postRes.body.fragment.id;

    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth(...auth)
      .set('Content-Type', 'text/html')
      .send('<p>Invalid</p>');

    expect(putRes.status).toBe(400);
    expect(putRes.body.status).toBe('error');
  });

  test('successfully updates fragment with correct Content-Type', async () => {
    const data = Buffer.from('TestString');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    const id = postRes.body.fragment.id;

    // Update with same content-type
    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth(...auth)
      .set('Content-Type', 'text/plain')
      .send(updatedData);

    expect(putRes.status).toBe(200);
    expect(putRes.body.status).toBe('ok');

    const fragment = putRes.body.fragment;

    expect(fragment).toHaveProperty('id');
    expect(fragment).toHaveProperty('ownerId');
    expect(fragment).toHaveProperty('created');
    expect(fragment).toHaveProperty('updated');
    expect(fragment).toHaveProperty('type', 'text/plain');
    expect(fragment).toHaveProperty('size');

    // Confirm the updated content
    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth(...auth);

    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe(updatedData);
  });
});
