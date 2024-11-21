const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Import router and models
const postRoutes = require('./postRouter'); // Adjust if necessary
const { AuthService } = require('../services/authService');

// Set up the Express app
const app = express();
app.use(bodyParser.json());
app.use('/posts', postRoutes);

// Mock the Post and User models
jest.mock('../models/posts', () => ({
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
}));

jest.mock('../models/users', () => ({
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndDelete: jest.fn(),
}));

// Mock AuthService
jest.mock('../services/authService', () => ({
    AuthService: {
        verifyPassword: jest.fn(),
        hashPassword: jest.fn(),
    },
    AuthorizeUser: jest.fn((req, res, next) => {
        req.user = { id: 'mockUserId' };  // Mock the user id for authentication
        next();
    }),
}));

// Dummy data
const mockUserId = 'mockUserId';
const mockPostId = 'mockPostId';
const mockUser = {
    _id: mockUserId,
    username: 'testUser',
    password: 'hashedpassword',
    following: [],
};

const mockPost = {
    _id: mockPostId,
    title: 'Test Post',
    description: 'This is a test post',
    price: 20,
    tags: ['test', 'sample'],
    owner: mockUserId,
};

// Test cases
describe('Post Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test to avoid interference
    });

    test('GET /posts/search should return posts matching a query', async () => {
        // Mock Post.find to return mock data
        require('../models/posts').find.mockResolvedValue([mockPost]);

        const response = await request(app)
            .get('/posts/search')
            .query({ query: 'test' });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.posts.length).toBeGreaterThan(0);
        expect(response.body.posts[0].title).toBe(mockPost.title);
    });

    test('POST /posts/create should create a post', async () => {
        const postData = {
            title: 'New Post',
            description: 'A new test post',
            price: 30,
            tags: ['new', 'test'],
            owner: mockUserId,
        };

        // Mock the Post.create method to simulate successful post creation
        require('../models/posts').create.mockResolvedValue(mockPost);

        const response = await request(app)
            .post('/posts/create')
            .set('Authorization', `Bearer mockAuthToken`) // Mock the token validation
            .send(postData);

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Post successfully created');
    });

    test('GET /posts/following should return posts from followed users', async () => {
        // Mock the Post.find to return posts from followed users
        require('../models/posts').find.mockResolvedValue([mockPost]);

        const response = await request(app)
            .get('/posts/following')
            .set('Authorization', `Bearer mockAuthToken`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /posts/explore should return the newest posts', async () => {
        // Mock Post.find to return the newest posts
        require('../models/posts').find.mockResolvedValue([mockPost]);

        const response = await request(app).get('/posts/explore');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /posts/user should return posts created by the logged-in user', async () => {
        // Mock Post.find to return the logged-in user's posts
        require('../models/posts').find.mockResolvedValue([mockPost]);

        const response = await request(app)
            .get('/posts/user')
            .set('Authorization', `Bearer mockAuthToken`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /posts/:id should return a single post by ID', async () => {
        // Mock Post.findById to return a specific post
        require('../models/posts').findById.mockResolvedValue(mockPost);

        const response = await request(app).get(`/posts/${mockPostId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.post.title).toBe(mockPost.title);
    });
});
