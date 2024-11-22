const request = require('supertest');
const express = require('express');
const session = require('express-session');

// Create express app
const app = express();

// Mock entire modules
jest.mock('../services/authService', () => ({
  AuthorizeUser: jest.fn((req, res, next) => next())
}));

jest.mock('../services/fileService', () => ({
  uploadToMemory: {
    single: jest.fn(() => (req, res, next) => {
      if (req.file) {
        req.file = {
          buffer: Buffer.from('mock-image-content'),
          originalname: 'test.jpg',
          mimetype: 'image/jpeg'
        };
      }
      next();
    })
  }
}));

jest.mock('../services/verifyService', () => ({
  VerifyLastId: jest.fn((req, res, next) => next()),
  VerifyParamsId: jest.fn((req, res, next) => next()),
  VerifyS3: jest.fn((req, res, next) => next()),
  SanitizeSearch: jest.fn((req, res, next) => next()),
  VerifyValidationResult: jest.fn((req, res, next) => next()),
  EscapeNewPost: jest.fn((req, res, next) => next()),
  EscapeNewComment: jest.fn((req, res, next) => next())
}));

jest.mock('../controllers/postController', () => ({
  search: jest.fn(),
  newPost: jest.fn(),
  following: jest.fn(),
  explore: jest.fn(),
  userPosts: jest.fn(),
  getPostInfo: jest.fn(),
  getComments: jest.fn(),
  postComment: jest.fn()
}));

// Import after mocking
const { AuthorizeUser } = require('../services/authService');
const { uploadToMemory } = require('../services/fileService');
const {
  VerifyLastId,
  VerifyParamsId,
  VerifyS3,
  SanitizeSearch,
  VerifyValidationResult,
  EscapeNewPost,
  EscapeNewComment
} = require('../services/verifyService');
const controller = require('../controllers/postController');
const postRouter = require('../routes/postRouter');

// Setup express app for testing
app.use(express.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false
}));
app.use('/api/posts', postRouter);

describe('Post Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/posts/search', () => {
    const mockPosts = [
      { id: 1, content: 'Test post 1' },
      { id: 2, content: 'Test post 2' }
    ];

    it('should search posts with valid query', async () => {
      controller.search.mockImplementation((req, res) => {
        res.json({ posts: mockPosts });
      });

      const response = await request(app)
        .get('/api/posts/search')
        .query({ q: 'test', lastId: '0' })
        .expect(200);

      expect(VerifyLastId).toHaveBeenCalled();
      expect(SanitizeSearch).toHaveBeenCalled();
      expect(VerifyValidationResult).toHaveBeenCalled();
      expect(response.body).toEqual({ posts: mockPosts });
    });

    it('should handle validation errors', async () => {
      VerifyValidationResult.mockImplementationOnce((req, res, next) => {
        res.status(400).json({ errors: ['Invalid search parameters'] });
      });

      const response = await request(app)
        .get('/api/posts/search')
        .query({ q: '' })
        .expect(400);

      expect(response.body).toEqual({ errors: ['Invalid search parameters'] });
      expect(controller.search).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/posts/create', () => {
    const mockPost = {
      content: 'Test post content',
      tags: ['test', 'jest']
    };

    it('should create new post with image', async () => {
      controller.newPost.mockImplementation((req, res) => {
        res.status(201).json({
          message: 'Post created successfully',
          postId: 1
        });
      });

      const response = await request(app)
        .post('/api/posts/create')
        .field('content', mockPost.content)
        .field('tags', JSON.stringify(mockPost.tags))
        .attach('image', Buffer.from('fake-image'), 'test.jpg')
        .expect(201);

      expect(AuthorizeUser).toHaveBeenCalled();
      expect(EscapeNewPost).toHaveBeenCalled();
      expect(VerifyValidationResult).toHaveBeenCalled();
      expect(response.body.postId).toBe(1);
    });

    it('should handle unauthorized post creation', async () => {
      AuthorizeUser.mockImplementationOnce((req, res, next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/api/posts/create')
        .field('content', mockPost.content)
        .attach('image', Buffer.from('fake-image'), 'test.jpg')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(controller.newPost).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/posts/following', () => {
    const mockFollowingPosts = [
      { id: 1, content: 'Following post 1' },
      { id: 2, content: 'Following post 2' }
    ];

    it('should return followed users posts', async () => {
      controller.following.mockImplementation((req, res) => {
        res.json({ posts: mockFollowingPosts });
      });

      const response = await request(app)
        .get('/api/posts/following')
        .query({ lastId: '0' })
        .expect(200);

      expect(AuthorizeUser).toHaveBeenCalled();
      expect(VerifyLastId).toHaveBeenCalled();
      expect(VerifyS3).toHaveBeenCalled();
      expect(response.body.posts).toEqual(mockFollowingPosts);
    });

    it('should handle unauthorized access', async () => {
      AuthorizeUser.mockImplementationOnce((req, res, next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      await request(app)
        .get('/api/posts/following')
        .expect(401);

      expect(controller.following).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/posts/explore', () => {
    const mockExplorePosts = [
      { id: 1, content: 'Explore post 1' },
      { id: 2, content: 'Explore post 2' }
    ];

    it('should return explore posts', async () => {
      controller.explore.mockImplementation((req, res) => {
        res.json({ posts: mockExplorePosts });
      });

      const response = await request(app)
        .get('/api/posts/explore')
        .query({ lastId: '0' })
        .expect(200);

      expect(VerifyLastId).toHaveBeenCalled();
      expect(VerifyS3).toHaveBeenCalled();
      expect(response.body.posts).toEqual(mockExplorePosts);
    });

    it('should handle pagination', async () => {
      const lastId = '10';
      await request(app)
        .get('/api/posts/explore')
        .query({ lastId })
        .expect(200);

      expect(VerifyLastId).toHaveBeenCalled();
      const verifyLastIdCall = VerifyLastId.mock.calls[0][0];
      expect(verifyLastIdCall.query.lastId).toBe(lastId);
    });
  });

  describe('GET /api/posts/user', () => {
    const mockUserPosts = [
      { id: 1, content: 'User post 1' },
      { id: 2, content: 'User post 2' }
    ];

    it('should return user posts', async () => {
      controller.userPosts.mockImplementation((req, res) => {
        res.json({ posts: mockUserPosts });
      });

      const response = await request(app)
        .get('/api/posts/user')
        .query({ lastId: '0' })
        .expect(200);

      expect(AuthorizeUser).toHaveBeenCalled();
      expect(VerifyLastId).toHaveBeenCalled();
      expect(VerifyS3).toHaveBeenCalled();
      expect(response.body.posts).toEqual(mockUserPosts);
    });
  });

  describe('GET /api/posts/:id', () => {
    const mockPost = {
      id: 1,
      content: 'Test post',
      user: { id: 1, username: 'testuser' }
    };

    it('should return post by id', async () => {
      controller.getPostInfo.mockImplementation((req, res) => {
        res.json(mockPost);
      });

      const response = await request(app)
        .get('/api/posts/1')
        .expect(200);

      expect(VerifyParamsId).toHaveBeenCalled();
      expect(VerifyS3).toHaveBeenCalled();
      expect(response.body).toEqual(mockPost);
    });

    it('should handle non-existent post', async () => {
      controller.getPostInfo.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Post not found' });
      });

      const response = await request(app)
        .get('/api/posts/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Post not found' });
    });
  });

  describe('GET /api/posts/:id/comments', () => {
    const mockComments = [
      { id: 1, content: 'Test comment 1' },
      { id: 2, content: 'Test comment 2' }
    ];

    it('should return post comments', async () => {
      controller.getComments.mockImplementation((req, res) => {
        res.json({ comments: mockComments });
      });

      const response = await request(app)
        .get('/api/posts/1/comments')
        .query({ lastId: '0' })
        .expect(200);

      expect(VerifyParamsId).toHaveBeenCalled();
      expect(VerifyLastId).toHaveBeenCalled();
      expect(VerifyS3).toHaveBeenCalled();
      expect(response.body.comments).toEqual(mockComments);
    });
  });

  describe('POST /api/posts/:id/comments', () => {
    const mockComment = {
      content: 'Test comment'
    };

    it('should create new comment', async () => {
      controller.postComment.mockImplementation((req, res) => {
        res.status(201).json({
          message: 'Comment created successfully',
          commentId: 1
        });
      });

      const response = await request(app)
        .post('/api/posts/1/comments')
        .send(mockComment)
        .expect(201);

      expect(AuthorizeUser).toHaveBeenCalled();
      expect(VerifyParamsId).toHaveBeenCalled();
      expect(VerifyS3).toHaveBeenCalled();
      expect(EscapeNewComment).toHaveBeenCalled();
      expect(VerifyValidationResult).toHaveBeenCalled();
      expect(response.body.commentId).toBe(1);
    });

    it('should handle validation errors in comment creation', async () => {
      VerifyValidationResult.mockImplementationOnce((req, res, next) => {
        res.status(400).json({ errors: ['Invalid comment content'] });
      });

      const response = await request(app)
        .post('/api/posts/1/comments')
        .send({ content: '' })
        .expect(400);

      expect(response.body).toEqual({ errors: ['Invalid comment content'] });
      expect(controller.postComment).not.toHaveBeenCalled();
    });
  });
});