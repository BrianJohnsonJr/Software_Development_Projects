const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/users');
const Post = require('../models/posts');
const Comment = require('../models/comments');
const { uploadToCloud, replaceFilePath, replaceCommentProfilePicPath } = require('../services/fileService');
const postController = require('../controllers/postController');

// Mock the required services
jest.mock('../services/fileService');

let mongoServer;
let app;
let testUsers = [];
let testPosts = [];
let testComments = [];

// Create Express app for testing
function createTestApp() {
    const app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    const authMiddleware = (req, res, next) => {
        req.user = { id: testUsers[0]?._id }; // Use the first test user by default
        next();
    };

    // Mock file upload middleware
    const uploadMiddleware = (req, res, next) => {
        if (req.file) {
            req.file = {
                filename: 'test-image.jpg',
                buffer: Buffer.from('test')
            };
        }
        next();
    };

    // Mock S3 middleware
    app.use((req, res, next) => {
        req.s3 = {}; // Mock S3 client
        next();
    });

    // Configure routes
    app.get('/api/posts/search', postController.search);
    app.post('/api/posts/new', authMiddleware, uploadMiddleware, postController.newPost);
    app.get('/api/posts/following', authMiddleware, postController.following);
    app.get('/api/posts/explore', postController.explore);
    app.get('/api/posts/user', authMiddleware, postController.userPosts);
    app.get('/api/posts/:id/comments', postController.getComments);
    app.post('/api/posts/:id/comments', authMiddleware, postController.postComment);
    app.get('/api/posts/:id', postController.getPostInfo);

    // Error handling middleware
    app.use((err, req, res, next) => {
        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });
    });

    return app;
}

describe('Post Controller Tests', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        
        // Reset all mocks before each test suite
        jest.clearAllMocks();
        
        // Create the test app
        app = createTestApp();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(() => {
        // Clear the test arrays before each test
        testUsers = [];
        testPosts = [];
        testComments = [];
    });

    afterEach(async () => {
        // Clean up test data
        for (const user of testUsers) {
            await User.findByIdAndDelete(user._id);
        }
        for (const comment of testComments) {
            await Comment.findByIdAndDelete(comment._id);
        }
    });

    describe('search', () => {
        beforeEach(async () => {
            const user = await User.create({
                username: 'testuser',
                name: 'Test User',
                email: 'test@test.com',
                password: 'password123'
            });
            testUsers.push(user);

            const posts = await Promise.all([
                Post.create({
                    title: 'Test Post 1',
                    description: 'Description 1',
                    price: 100,
                    itemType: 'clothing',
                    tags: ['summer', 'casual'],
                    owner: user._id,
                    image: 'test1.jpg'
                }),
                Post.create({
                    title: 'Another Post',
                    description: 'Description 2',
                    price: 200,
                    itemType: 'accessories',
                    tags: ['winter', 'formal'],
                    owner: user._id,
                    image: 'test2.jpg'
                })
            ]);
            testPosts.push(...posts);
        });

        it('should search posts by title', async () => {
            const response = await request(app)
                .get('/api/posts/search')
                .query({ query: 'Test Post' });

            expect(response.status).toBe(200);
            expect(response.body.posts).toHaveLength(1);
            expect(response.body.posts[0].title).toBe('Test Post 1');
        });

        it('should search posts by description', async () => {
            const response = await request(app)
                .get('/api/posts/search')
                .query({ query: 'Description' });

            expect(response.status).toBe(200);
        });

        it('should search posts by tags', async () => {
            const response = await request(app)
                .get('/api/posts/search')
                .query({ query: 'summer' });

            expect(response.status).toBe(200);
        });
    });

    describe('newPost', () => {
        beforeEach(async () => {
            const user = await User.create({
                rating: "rating",
                username: 'postuser',
                name: 'Post User',
                email: 'post@test.com',
                password: 'password123'
            });
            testUsers.push(user);
            uploadToCloud.mockResolvedValue({ filename: 'uploaded-test.jpg' });
        });
        it('should create a new post successfully', async () => {
          const postData = {
              title: 'New Post',
              description: 'Test Description',
              price: 150,
              itemType: 'clothing',
              tags: ['test'],
              sizes: ['M', 'L']
          };

          const response = await request(app)
              .post('/api/posts/new')
              .attach('image', Buffer.from('fake-image'), 'test.jpg')
              .field('title', postData.title)
              .field('description', postData.description)
              .field('price', postData.price)
              .field('itemType', postData.itemType)
              .field('tags', JSON.stringify(postData.tags))
              .field('sizes', JSON.stringify(postData.sizes));

          const post = await Post.findById(response.body.postId);
          testPosts.push(post);
      });

        it('should reject post creation without required fields', async () => {
            const response = await request(app)
                .post('/api/posts/new')
                .attach('image', Buffer.from('fake-image'), 'test.jpg')
                .field('title', 'Test Title');

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Missing required fields');
        });
    });

    describe('following', () => {
        beforeEach(async () => {
            const [user1, user2] = await Promise.all([
                User.create({
                    rating: 4,
                    username: 'user1',
                    name: 'User One',
                    email: 'user1@test.com',
                    password: 'password123',
                    following: []
                }),
                User.create({
                    username: 'user2',
                    name: 'User Two',
                    email: 'user2@test.com',
                    password: 'password123'
                })
            ]);
            testUsers.push(user1, user2);

            // Update user1's following list
            user1.following.push(user2._id);
            await user1.save();

            const post = await Post.create({
                title: 'Following Test Post',
                description: 'Test Description',
                price: 100,
                itemType: 'clothing',
                owner: user2._id,
                image: 'test.jpg'
            });
            testPosts.push(post);
        });

        it('should return posts from followed users', async () => {
            const response = await request(app)
                .get('/api/posts/following');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('Following Test Post');
        });

        it('should return empty array when not following anyone', async () => {
            // Create a new user with no followings
            const loneUser = await User.create({
                rating: 4,
                username: 'loneuser',
                name: 'Lone User',
                email: 'lone@test.com',
                password: 'password123'
            });
            testUsers[0] = loneUser; // Replace the authenticated user

            const response = await request(app)
                .get('/api/posts/following');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0);
        });
    });

    describe('comments', () => {
        let testPost;

        beforeEach(async () => {
            const user = await User.create({
                rating: 4,
                username: 'commentuser',
                name: 'Comment User',
                email: 'comment@test.com',
                password: 'password123'
            });
            testUsers.push(user);

            testPost = await Post.create({
                title: 'Comment Test Post',
                description: 'Test Description',
                price: 100,
                itemType: 'clothing',
                owner: user._id,
                image: 'test.jpg'
            });
            testPosts.push(testPost);

            const comment = await Comment.create({
                postId: testPost._id,
                owner: user._id,
                text: 'Test comment',
                likes: 0,
                rating: 4
            });
            testComments.push(comment);
        });

        it('should get comments for a post', async () => {
            const response = await request(app)
                .get(`/api/posts/${testPost._id}/comments`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].text).toBe('Test comment');
        });

        it('should create a new comment', async () => {
            const response = await request(app)
                .post(`/api/posts/${testPost._id}/comments`)
                .send({
                    rating: 4,
                    text: 'New comment'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            
            const comment = await Comment.findById(response.body.commentId);
            expect(comment).toBeTruthy();
            expect(comment.text).toBe('New comment');
            testComments.push(comment);
        });

        it('should reject comment creation without text', async () => {
            const response = await request(app)
                .post(`/api/posts/${testPost._id}/comments`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Missing required field: text');
        });
    });
});