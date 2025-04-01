// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

'text/plain',
  'text/plain; charset=utf-8',
  'text/markdown',
  'text/html',
  'text/csv',
  'application/json',
  'application/yaml',
  describe('GET /v1/fragments', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () =>
      request(app).get('/v1/fragments').expect(401));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', () =>
      request(app)
        .get('/v1/fragments')
        .auth('invalid@email.com', 'incorrect_password')
        .expect(401));

    // Using a valid username/password pair should give a success result with a .fragments array
    test('authenticated users get a fragments array', async () => {
      const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(Array.isArray(res.body.fragments)).toBe(true);
    });

    test('Should receive some form of data in body if populated and added to fragments array', async () => {
      const data = Buffer.from('TestString');

      const response = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send(data);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('ok');

      const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
      expect(res.body.status).toBe('ok');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.fragments)).toBe(true);
      expect(res.body.fragments.length).toBe(1);
    });

    test('Using id to get specific fragment for text/plain', async () => {
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
      expect(res2.headers['content-type']).toBe('text/plain');
      expect(res2.text).toBe('TestString');
    });

    test('Using id to get specific fragment for text/markdown', async () => {
      const data = Buffer.from('# Mark down text');

      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/markdown')
        .send(data);

      const res1 = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
      expect(res1.statusCode).toBe(200);
      expect(res1.body.status).toBe('ok');
      expect(Array.isArray(res1.body.fragments)).toBe(true);

      const fragmentId = res1.body.fragments[2];
      const res2 = await request(app)
        .get(`/v1/fragments/${fragmentId}`)
        .auth('user1@email.com', 'password1');

      expect(res2.statusCode).toBe(200);
      expect(res2.headers['content-type']).toBe('text/markdown');
      expect(res2.text).toBe('# Mark down text');
    });

    test('Using id to get specific fragment for text/html', async () => {
      const data = Buffer.from('<p> html text </p>');

      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/html')
        .send(data);

      const res1 = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
      expect(res1.statusCode).toBe(200);
      expect(res1.body.status).toBe('ok');
      expect(Array.isArray(res1.body.fragments)).toBe(true);

      const fragmentId = res1.body.fragments[3];
      const res2 = await request(app)
        .get(`/v1/fragments/${fragmentId}`)
        .auth('user1@email.com', 'password1');

      expect(res2.statusCode).toBe(200);
      expect(res2.headers['content-type']).toBe('text/html');
      expect(res2.text).toBe('<p> html text </p>');
    });

    test('Using id to get specific fragment for text/csv', async () => {
      const data = Buffer.from('Name,Age,Email');

      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/csv')
        .send(data);

      const res1 = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
      expect(res1.statusCode).toBe(200);
      expect(res1.body.status).toBe('ok');
      expect(Array.isArray(res1.body.fragments)).toBe(true);

      const fragmentId = res1.body.fragments[4];
      const res2 = await request(app)
        .get(`/v1/fragments/${fragmentId}`)
        .auth('user1@email.com', 'password1');

      expect(res2.statusCode).toBe(200);

      expect(res2.headers['content-type']).toBe('text/csv');

      expect(res2.text).toBe('Name,Age,Email');
    });

    test('Using id to get specific fragment for application/json', async () => {
      const data = Buffer.from(
        JSON.stringify({
          name: 'test',
          age: 30,
          email: 'test@example.com',
        })
      );

      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'application/json')
        .send(data);

      const res1 = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
      expect(res1.statusCode).toBe(200);
      expect(res1.body.status).toBe('ok');
      expect(Array.isArray(res1.body.fragments)).toBe(true);

      const fragmentId = res1.body.fragments[5];
      const res2 = await request(app)
        .get(`/v1/fragments/${fragmentId}`)
        .auth('user1@email.com', 'password1');

      expect(res2.statusCode).toBe(200);

      expect(res2.headers['content-type']).toBe('application/json');

      const result = Buffer.from(res2.body.data).toString();

      expect(result).toBe(data.toString());
    });

    test('Using id to get specific fragment for application/yaml', async () => {
      const yamlText = `name: test\nage: 30\nemail: test@example.com`;
      const data = Buffer.from(yamlText);

      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'application/yaml')
        .send(data);

      const res1 = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
      expect(res1.statusCode).toBe(200);
      expect(res1.body.status).toBe('ok');
      expect(Array.isArray(res1.body.fragments)).toBe(true);

      const fragmentId = res1.body.fragments[res1.body.fragments.length - 1];
      const res2 = await request(app)
        .get(`/v1/fragments/${fragmentId}`)
        .auth('user1@email.com', 'password1');

      expect(res2.statusCode).toBe(200);

      expect(res2.headers['content-type']).toBe('application/yaml');

      const result = res2.text;
      expect(result).toBe(yamlText);
    });

    test('Invalid id to get fragment', async () => {
      const fragmentId = 'invalid';
      const res = await request(app)
        .get(`/v1/fragments/${fragmentId}`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(404);
    });

    test('Using id to get specific fragment meta data from info route', async () => {
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

      const fragmentId = res1.body.fragments[res1.body.fragments.length - 1];
      const res2 = await request(app)
        .get(`/v1/fragments/${fragmentId}/info`)
        .auth('user1@email.com', 'password1');

      expect(res2.statusCode).toBe(200);
      expect(res2.body.status).toBe('ok');
      expect(res2.body.fragment).toBeDefined();
      expect(res2.body.fragment).toHaveProperty('id');
      expect(res2.body.fragment).toHaveProperty('ownerId');
      expect(res2.body.fragment).toHaveProperty('created');
      expect(res2.body.fragment).toHaveProperty('updated');
      expect(res2.body.fragment).toHaveProperty('type', 'text/plain');
      expect(res2.body.fragment).toHaveProperty('size', data.length);
    });

    test('Invalid id to get fragment meta data from info route', async () => {
      const fragmentId = 'invalid';
      const res = await request(app)
        .get(`/v1/fragments/${fragmentId}/info`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(404);
    });

    test('Using ext to convert md fragment to html', async () => {
      const data = Buffer.from('# markdown test');

      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/markdown')
        .send(data);

      const res1 = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
      expect(res1.statusCode).toBe(200);
      expect(res1.body.status).toBe('ok');
      expect(Array.isArray(res1.body.fragments)).toBe(true);

      const fragmentId = res1.body.fragments[res1.body.fragments.length - 1];
      const res2 = await request(app)
        .get(`/v1/fragments/${fragmentId}.html`)
        .auth('user1@email.com', 'password1');

      expect(res2.statusCode).toBe(200);

      expect(res2.headers['content-type']).toBe('text/html; charset=utf-8');

      const result = res2.text;

      expect(result.trim()).toBe('<h1>markdown test</h1>');
    });

    test('Invalid id to get fragment extension', async () => {
      const fragmentId = 'invalid';
      const res = await request(app)
        .get(`/v1/fragments/${fragmentId}.txt`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(404);
    });
  });
