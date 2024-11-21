const request = require('supertest');
const express = require('express');
const postRouter = require('../routes/postRouter'); // Adjust path as needed
const { AuthorizeUser } = require('../services/authService');
const controller = require('../controllers/postController');

// Mocking services and middlewares
jest.mock('../services/authService', () => ({
  AuthorizeUser: jest.fn((req, res, next) => next()), // Mocked Authorization middleware
}));

jest.mock('../services/verifyService', () => ({
  VerifyParamsId: jest.fn((req, res, next) => next()),
  VerifyLastId: jest.fn((req, res, next) => next()),
  VerifyS3: jest.fn((req, res, next) => next()),
  SanitizeSearch: jest.fn((req, res, next) => next()),
  VerifyValidationResult: jest.fn((req, res, next) => next()),
  EscapeNewPost: jest.fn((req, res, next) => next()),
  EscapeNewComment: jest.fn((req, res, next) => next()),
}));

jest.mock('../services/fileService', () => ({
  uploadToMemory: { none: jest.fn().mockReturnThis(), single: jest.fn().mockReturnThis() },
}));

jest.mock('../controllers/postController', () => ({
  search: jest.fn((req, res) => res.status(200).json([{ postId: '123', content: 'Test post' }])),
  newPost: jest.fn((req, res) => res.status(201).send('Post created')),
  following: jest.fn((req, res) => res.status(200).json([{ postId: '124', content: 'Post from someone followed' }])),
  explore: jest.fn((req, res) => res.status(200).json([{ postId: '125', content: 'Exploration post' }])),
  userPosts: jest.fn((req, res) => res.status(200).json([{ postId: '126', content: 'User posts' }])),
  getPostInfo: jest.fn((req, res) => res.status(200).json({ postId: '127', content: 'Post data' })),
  getComments: jest.fn((req, res) => res.status(200).json([{ commentId: '1', text: 'Great post!' }])),
  postComment: jest.fn((req, res) => res.status(201).send('Comment posted')),
}));

describe('Post Router', () => {
  const app = express();
  app.use(express.json());
  app.use('/posts', postRouter);

  test('GET /search should return posts matching the query', async () => {
    const response = await request(app).get('/posts/search?query=test');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ postId: '123', content: 'Test post' }]);
  });

  test('POST /create should create a new post', async () => {
    const response = await request(app)
      .post('/posts/create')
      .send({ content: 'New post content' })
      .attach('image', 'path/to/image.jpg'); // Adjust image path accordingly

    expect(response.status).toBe(201);
    expect(response.text).toBe('Post created');
  });

  test('GET /following should return posts from followed users', async () => {
    const response = await request(app).get('/posts/following');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ postId: '124', content: 'Post from someone followed' }]);
  });

  test('GET /explore should return the newest posts', async () => {
    const response = await request(app).get('/posts/explore');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ postId: '125', content: 'Exploration post' }]);
  });

  test('GET /user should return posts by the signed-in user', async () => {
    const response = await request(app).get('/posts/user');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ postId: '126', content: 'User posts' }]);
  });

  test('GET /:id should return post data by ID', async () => {
    const response = await request(app).get('/posts/127');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ postId: '127', content: 'Post data' });
  });

  test('GET /:id/comments should return comments for a post', async () => {
    const response = await request(app).get('/posts/127/comments');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ commentId: '1', text: 'Great post!' }]);
  });

  test('POST /:id/comments should post a new comment', async () => {
    const response = await request(app)
      .post('/posts/127/comments')
      .send({ text: 'This is a comment' });

    expect(response.status).toBe(201);
    expect(response.text).toBe('Comment posted');
  });
});