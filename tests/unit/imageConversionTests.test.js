const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../../src/app');

const auth = ['user1@email.com', 'password1'];

const imageCases = [
  {
    filename: 'test.png',
    contentType: 'image/png',
    conversions: ['jpg', 'webp', 'gif', 'avif', 'png'],
  },
  {
    filename: 'test.jpg',
    contentType: 'image/jpeg',
    conversions: ['png', 'webp', 'gif', 'avif', 'jpg'],
  },
  {
    filename: 'test.webp',
    contentType: 'image/webp',
    conversions: ['png', 'jpg', 'gif', 'avif', 'webp'],
  },
];

describe('Image-based conversion via extension', () => {
  imageCases.forEach(({ filename, contentType, conversions }) => {
    const filePath = path.join(__dirname, '../images', filename);
    const imageData = fs.readFileSync(filePath);
    const origExt = path.extname(filename);

    conversions.forEach((ext) => {
      test(`${origExt} -> .${ext}`, async () => {
        const postRes = await request(app)
          .post('/v1/fragments')
          .auth(...auth)
          .set('Content-Type', contentType)
          .send(imageData);

        expect(postRes.statusCode).toBe(201);
        const id = postRes.body.fragment.id;

        const getRes = await request(app)
          .get(`/v1/fragments/${id}.${ext}`)
          .auth(...auth);

        expect(getRes.statusCode).toBe(200);
        expect(getRes.headers['content-type'].startsWith('image/')).toBe(true);
        expect(Buffer.isBuffer(getRes.body)).toBe(true);
      });
    });
  });

  test('returns 415 for unsupported image conversion', async () => {
    const pngPath = path.join(__dirname, '../images/test.png');
    const imageData = fs.readFileSync(pngPath);

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...auth)
      .set('Content-Type', 'image/png')
      .send(imageData);

    const id = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.json`)
      .auth(...auth);

    expect(getRes.statusCode).toBe(415);
  });
});
