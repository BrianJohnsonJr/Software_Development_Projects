const request = require('supertest');
const app = require('../app'); // Assuming the Express app is in 'app.js'
const { User } = require('../models/users');
const { Post } = require('../models/posts');
const { Comment } = require('../models/comments');
const { uploadToMemory, replaceFilePath, replaceCommentProfilePicPath } = require('../services/fileService');
const { AuthorizeUser, VerifyLastId, VerifyParamsId, VerifyS3, SanitizeSearch, VerifyValidationResult, EscapeNewPost, EscapeNewComment } = require('../services/verifyService');

// Mocking external services and modules
jest.mock('../models/users');
jest.mock('../models/posts');
jest.mock('../models/comments');
jest.mock('../services/fileService');
jest.mock('../services/verifyService');

describe('Post Router Tests', () => {
    let user, post, comment;

    beforeAll(() => {
        user = { _id: '123', username: 'testuser', email: 'test@example.com', password: 'hashedpassword' };
        post = { _id: '456', title: 'Test Post', description: 'A test post description', owner: user._id };
        comment = { _id: '789', postId: post._id, owner: user._id, text: 'Test comment' };
    });

    beforeEach(() => {
        User.findById.mockClear();
        Post.find.mockClear();
        Post.findById.mockClear();
        Comment.find.mockClear();
        Comment.save.mockClear();
        uploadToMemory.mockClear();
    });

    test('GET /search - should query posts based on search query', async () => {
        // Mocking the Post.find behavior
        Post.find.mockResolvedValue([post]);

        const res = await request(app)
            .get('/search')
            .query({ query: 'Test' })
            .expect(200);

        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('title', 'Test Post');
    });

    test('POST /create - should create a new post', async () => {
        // Mocking file upload behavior
        uploadToMemory.mockResolvedValue({ buffer: 'filebuffer' });

        // Mocking user and post creation
        User.findById.mockResolvedValue(user);
        Post.prototype.save.mockResolvedValue(post);

        const res = await request(app)
            .post('/create')
            .set('Cookie', 'token=validtoken')
            .field('title', 'New Post')
            .field('description', 'Post description')
            .field('price', '100')
            .field('itemType', 'itemType')
            .attach('image', Buffer.from('filebuffer'))
            .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Post successfully created');
        expect(res.body.postId).toBe(post._id.toString());
    });

    test('GET /following - should retrieve posts from followed users', async () => {
        // Mocking Post.find behavior
        Post.find.mockResolvedValue([post]);

        const res = await request(app)
            .get('/following')
            .set('Cookie', 'token=validtoken')
            .expect(200);

        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('title', 'Test Post');
    });

    test('GET /explore - should retrieve the newest posts', async () => {
        // Mocking Post.find behavior
        Post.find.mockResolvedValue([post]);

        const res = await request(app)
            .get('/explore')
            .expect(200);

        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('title', 'Test Post');
    });

    test('GET /user - should retrieve posts from the logged-in user', async () => {
        // Mocking Post.find behavior
        Post.find.mockResolvedValue([post]);

        const res = await request(app)
            .get('/user')
            .set('Cookie', 'token=validtoken')
            .expect(200);

        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('title', 'Test Post');
    });

    test('GET /:id - should retrieve a specific post', async () => {
        // Mocking Post.findById behavior
        Post.findById.mockResolvedValue(post);

        const res = await request(app)
            .get(`/post/${post._id}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.post).toHaveProperty('title', 'Test Post');
    });

    test('GET /:id/comments - should retrieve comments for a post', async () => {
        // Mocking Comment.find behavior
        Comment.find.mockResolvedValue([comment]);

        const res = await request(app)
            .get(`/post/${post._id}/comments`)
            .expect(200);

        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('text', 'Test comment');
    });

    test('POST /:id/comments - should post a comment on a post', async () => {
        // Mocking Comment.save behavior
        Comment.prototype.save.mockResolvedValue(comment);
        User.findById.mockResolvedValue(user);

        const res = await request(app)
            .post(`/post/${post._id}/comments`)
            .set('Cookie', 'token=validtoken')
            .send({ text: 'Test comment' })
            .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Comment successfully created');
        expect(res.body.commentId).toBe(comment._id.toString());
    });

    test('POST /:id/comments - should return error if comment text is missing', async () => {
        const res = await request(app)
            .post(`/post/${post._id}/comments`)
            .set('Cookie', 'token=validtoken')
            .send({})
            .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Missing required field: text');
    });
});
