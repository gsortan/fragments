// tests/unit/textConversion.test.js
const request = require('supertest');
const app = require('../../src/app');

const auth = ['user1@email.com', 'password1'];

describe('Text-based conversion via extension', () => {
  const cases = [
    {
      desc: 'markdown -> html',
      content: '# Hello **world**',
      contentType: 'text/markdown',
      ext: 'html',
      expectedType: 'text/html',
      expectedBodyIncludes: '<h1>Hello <strong>world</strong></h1>',
    },
    {
      desc: 'markdown -> txt',
      content: '# Hello **world**',
      contentType: 'text/markdown',
      ext: 'txt',
      expectedType: 'text/plain',
      expectedBodyIncludes: '# Hello **world**',
    },
    {
      desc: 'html -> txt',
      content: '<p>Hello world</p>',
      contentType: 'text/html',
      ext: 'txt',
      expectedType: 'text/plain',
      expectedBodyIncludes: '<p>Hello world</p>',
    },
    {
      desc: 'csv -> json',
      content: 'name,age\nTester,30\nTester,25',
      contentType: 'text/csv',
      ext: 'json',
      expectedType: 'application/json',
      expectedBodyIncludes: JSON.stringify(
        [
          { name: 'Tester', age: '30' },
          { name: 'Tester', age: '25' },
        ],
        null,
        2
      ),
    },
    {
      desc: 'csv -> txt',
      content: 'name,age\nJohn,30\nJane,25',
      contentType: 'text/csv',
      ext: 'txt',
      expectedType: 'text/plain',
      expectedBodyIncludes: ['name,age', 'John,30', 'Jane,25'],
    },
    {
      desc: 'json -> yaml',
      content: JSON.stringify({ name: 'John', age: 30 }),
      contentType: 'application/json',
      ext: 'yaml',
      expectedType: 'application/yaml',
      expectedBodyIncludes: ['name: John', 'age: 30'],
    },
    {
      desc: 'yaml -> json',
      content: 'name: John\nage: 30',
      contentType: 'application/yaml',
      ext: 'json',
      expectedType: 'application/json',
      expectedBodyIncludes: ['"name": "John"', '"age": 30'],
    },
    {
      desc: 'json -> txt',
      content: '{"name": "John"}',
      contentType: 'application/json',
      ext: 'txt',
      expectedType: 'text/plain',
      expectedBodyIncludes: '{"name": "John"}',
    },
    {
      desc: 'yaml -> txt',
      content: 'name: John',
      contentType: 'application/yaml',
      ext: 'txt',
      expectedType: 'text/plain',
      expectedBodyIncludes: 'name: John',
    },

    {
      desc: 'markdown -> markdown',
      content: '# Sample',
      contentType: 'text/markdown',
      ext: 'md',
      expectedType: 'text/markdown',
      expectedBodyIncludes: '# Sample',
    },
    {
      desc: 'html -> html',
      content: '<p>Hello</p>',
      contentType: 'text/html',
      ext: 'html',
      expectedType: 'text/html',
      expectedBodyIncludes: '<p>Hello</p>',
    },
    {
      desc: 'json -> json',
      content: JSON.stringify({ test: true }),
      contentType: 'application/json',
      ext: 'json',
      expectedType: 'application/json',
      expectedBodyIncludes: '"test":true',
    },
    {
      desc: 'yaml -> yaml',
      content: 'foo: bar',
      contentType: 'application/yaml',
      ext: 'yaml',
      expectedType: 'application/yaml',
      expectedBodyIncludes: 'foo: bar',
    },
    {
      desc: 'csv -> csv',
      content: 'name,age\nA,1\nB,2',
      contentType: 'text/csv',
      ext: 'csv',
      expectedType: 'text/csv',
      expectedBodyIncludes: 'name,age',
    },
  ];

  cases.forEach(({ desc, content, contentType, ext, expectedType, expectedBodyIncludes }) => {
    test(desc, async () => {
      let data = content;

      const postRes = await request(app)
        .post('/v1/fragments')
        .auth(...auth)
        .set('Content-Type', contentType)
        .send(data);

      const id = postRes.body.fragment.id;

      const getRes = await request(app)
        .get(`/v1/fragments/${id}.${ext}`)
        .auth(...auth);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.headers['content-type'].startsWith(expectedType)).toBe(true);
      if (Array.isArray(expectedBodyIncludes)) {
        expectedBodyIncludes.forEach((expected) => {
          expect(getRes.text).toContain(expected);
        });
      } else {
        expect(getRes.text).toContain(expectedBodyIncludes);
      }
    });
  });

  test('returns 415 for unsupported conversion', async () => {
    const content = '{"name": "John"}';

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...auth)
      .set('Content-Type', 'application/json')
      .send(content);

    const id = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.jpg`)
      .auth(...auth);

    expect(getRes.statusCode).toBe(415);
  });
});
