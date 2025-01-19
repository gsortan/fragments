const request = require('supertest');

const app = require('../../src/app');

describe('App testing', () => {
  test('route not found 404 error', () =>
    request(app).get('/v10434/fesfesfesfragments').expect(404));
});
