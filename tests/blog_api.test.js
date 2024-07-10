const { test, describe, after, beforeEach } = require('node:test');
const BlogPost = require('../models/blogpost');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const { strictEqual } = require('node:assert');
const assert = require('node:assert');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
  await BlogPost.deleteMany({});

  const blogpostObjects = helper.initialBlogPosts.map(
    (blogpost) => new BlogPost(blogpost)
  );
  const promiseArray = blogpostObjects.map((blogpost) => blogpost.save());
  await Promise.all(promiseArray);
});

describe('When there is initially some blogposts saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogposts')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogposts are returned', async () => {
    const response = await api.get('/api/blogposts');

    strictEqual(response.body.length, helper.initialBlogPosts.length);
  });

  test('a specific blogpost can be viewed', async () => {
    const blogpostsAtStart = await helper.blogpostsInDb();
    const blogPostToView = blogpostsAtStart[0];

    const resultBlogpost = await api
      .get(`/api/blogposts/${blogPostToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert.deepStrictEqual(resultBlogpost.body, blogPostToView);
  });

  test('a specific blogpost is among the returned blogposts', async () => {
    const blogpostsAtStart = await helper.blogpostsInDb();

    const blogpostTitles = blogpostsAtStart.map((r) => r.title);

    assert(blogpostTitles.includes('Testiblogipostaus2'));
  });

  test('a specific blogpost can be updated', async () => {
    const blogpostsAtStart = await helper.blogpostsInDb();
    const amountOfLikesAtStart = blogpostsAtStart[0].likes;
    const blogpostId = blogpostsAtStart[0].id;

    const updatedLikes = await api
      .put(`/api/blogposts/${blogpostId}`)
      .send({ likes: amountOfLikesAtStart + 3 });
    assert.strictEqual(updatedLikes.body.likes, 4);
  });

  test('a blogpost with invalid id fails with 400', async () => {
    const blogpostsAtStart = await helper.blogpostsInDb();
    const amountOfLikesAtStart = blogpostsAtStart[0].likes;

    const updatedLikes = await api
      .put('/api/blogposts/5')
      .send({ likes: amountOfLikesAtStart + 3 })
      .expect(400);
    assert.strictEqual(updatedLikes.body.error, 'malformatted id');
  });
});

describe('addition of a blogpost', () => {
  test('a valid blogpost can be added', async () => {
    const newBlogpost = {
      title: 'Valid new Blogpost',
      author: 'Seppo TestiBlogipostinen',
      url: 'www.validBlogposturl.fi',
      likes: 3,
      userId: '668dfe695c1a154a3b01e67f',
    };
    await api
      .post('/api/blogposts')
      .send(newBlogpost)
      .expect(201)
      .expect('Content-type', /application\/json/);

    const response = await api.get('/api/blogposts');
    const titles = response.body.map((r) => r.title);

    strictEqual(response.body.length, helper.initialBlogPosts.length + 1);
    assert(titles.includes('Valid new Blogpost'));
  });

  test('blogpost without author fails with status code 400', async () => {
    const newBlogpost = {
      title: 'Valid new Blogpost',
      url: 'www.validBlogposturl.fi',
      likes: 3,
      userId: '668dfe695c1a154a3b01e67f',
    };
    await api.post('/api/blogposts').send(newBlogpost).expect(400);

    const response = await api.get('/api/blogposts');

    strictEqual(response.body.length, helper.initialBlogPosts.length);
  });

  test('blogpost without title fails with status code 400', async () => {
    const newBlogpost = {
      author: 'Author Name',
      url: 'www.validBlogposturl.fi',
      likes: 3,
      userId: '668dfe695c1a154a3b01e67f',
    };
    await api.post('/api/blogposts').send(newBlogpost).expect(400);

    const response = await api.get('/api/blogposts');

    strictEqual(response.body.length, helper.initialBlogPosts.length);
  });

  test('blogpost without url fails with status code 400', async () => {
    const newBlogpost = {
      title: 'Valid blogpost title',
      author: 'Author Name',
      likes: 3,
      userId: '668dfe695c1a154a3b01e67f',
    };
    await api.post('/api/blogposts').send(newBlogpost).expect(400);

    const response = await api.get('/api/blogposts');

    strictEqual(response.body.length, helper.initialBlogPosts.length);
  });

  test('blogpost without amount of likes gets 0 likes by default', async () => {
    const newBlogpost = {
      title: 'Valid blogpost title',
      url: 'www.validBlogposturl.fi',
      author: 'Author Name',
      userId: '668dfe695c1a154a3b01e67f',
    };
    await api.post('/api/blogposts').send(newBlogpost).expect(201);

    const response = await api.get('/api/blogposts');
    strictEqual(
      response.body.find((blogpost) => blogpost.title === newBlogpost.title)
        .likes,
      0
    );
  });
});

describe('deletion of a blogpost', () => {
  test('a blogpost can be deleted', async () => {
    const blogpostsAtStart = await helper.blogpostsInDb();
    const blogPostToDelete = blogpostsAtStart[0];
    await api.delete(`/api/blogposts/${blogPostToDelete.id}`).expect(204);

    const blogpostsAtEnd = await helper.blogpostsInDb();
    const titles = blogpostsAtEnd.map((r) => r.title);

    assert(!titles.includes(blogPostToDelete.title));
    strictEqual(blogpostsAtEnd.length, helper.initialBlogPosts.length - 1);
  });
});

after(async () => {
  await mongoose.connection.close();
});
