// tests/unit/delete.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments', () => {
  const auth = ['user1@email.com', 'password1'];

  test('returns 404 for non-existent fragment', async () => {
    const res = await request(app)
      .delete('/v1/fragments/nonexistent-id')
      .auth(...auth)
      .set('Content-Type', 'text/plain');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('successfully deletes fragment', async () => {
    const data = Buffer.from('TestString');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    const id = postRes.body.fragment.id;

    // Update with same content-type
    const delRes = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth(...auth)
      .set('Content-Type', 'text/plain');

    expect(delRes.status).toBe(200);
    expect(delRes.body.status).toBe('ok');
  });
});
