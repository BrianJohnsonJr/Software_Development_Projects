const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/users');
const { AuthService } = require('../services/authService');
const { uploadToCloud, replaceProfilePicPath } = require('../services/fileService');
const userController = require('../controllers/accountController');

// Mock the required services
jest.mock('../services/authService');
jest.mock('../services/fileService');

let mongoServer;
let app;
let testUsers = [];

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
                filename: 'test-file.jpg',
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
    app.get('/api/auth/check', authMiddleware, userController.authCheck);
    app.get('/api/users/search', userController.search);
    app.post('/api/auth/register', userController.register);
    app.post('/api/auth/login', userController.loginUser);
    app.post('/api/auth/logout', userController.logout);
    app.get('/api/users/profile', authMiddleware, userController.viewProfile);
    app.put('/api/users/profile/picture', authMiddleware, uploadMiddleware, userController.updateProfile);
    app.get('/api/users/:id', userController.getUserProfile);

    // Error handling middleware
    app.use((err, req, res, next) => {
        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });
    });

    return app;
}

describe('User Controller Tests', () => {
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
        // Clean up test users
        for (const user of testUsers) {
            await User.findByIdAndDelete(user._id);
        }
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(() => {
        // Clear the testUsers array before each test
        testUsers = [];
    });

    afterEach(async () => {
        // Clean up users created in the previous test
        for (const user of testUsers) {
            await User.findByIdAndDelete(user._id);
        }
    });

    describe('authCheck', () => {
        it('should return user information when authenticated', async () => {
            const user = await User.create({
                name: 'picturename',
                username: 'testuser',
                email: 'test@test.com',
                password: 'password123'
            });
            testUsers.push(user);

            const response = await request(app)
                .get('/api/auth/check')
                .send();

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toHaveProperty('username', 'testuser');
            expect(response.body.user).toHaveProperty('email', 'test@test.com');
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should return 404 when user not found', async () => {
            const response = await request(app)
                .get('/api/auth/check')
                .send();

            expect(response.status).toBe(404);
        });
    });

    describe('search', () => {
        beforeEach(async () => {
            const users = await Promise.all([
                User.create({ username: 'john_doe', name: 'John Doe', email: 'john@test.com', password: 'pass123' }),
                User.create({ username: 'jane_smith', name: 'Jane Smith', email: 'jane@test.com', password: 'pass123' })
            ]);
            testUsers.push(...users);
        });

        it('should search users by username', async () => {
            const response = await request(app)
                .get('/api/users/search')
                .query({ query: 'john' })
                .send();

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.users).toHaveLength(1);
            expect(response.body.users[0].username).toBe('john_doe');
        });

        it('should search users by name', async () => {
            const response = await request(app)
                .get('/api/users/search')
                .query({ query: 'Smith' })
                .send();

            expect(response.status).toBe(200);
            expect(response.body.users).toHaveLength(1);
            expect(response.body.users[0].name).toBe('Jane Smith');
        });
    });

    describe('register', () => {
        beforeEach(() => {
            AuthService.hashPassword.mockResolvedValue('hashedPassword123');
        });

        it('should register a new user successfully', async () => {
            const userData = {
                username: 'newuser',
                email: 'new@test.com',
                password: 'password123',
                name: 'New User',
                bio: 'Test bio'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User registered successfully');

            const user = await User.findOne({ username: 'newuser' });
            expect(user).toBeTruthy();
            expect(user.email).toBe(userData.email);
            testUsers.push(user);
        });

        it('should reject registration with existing username', async () => {
            const existingUser = await User.create({
                name: 'picturename',
                username: 'existinguser',
                email: 'existing@test.com',
                password: 'password123'
            });
            testUsers.push(existingUser);

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'picturename',
                    username: 'existinguser',
                    email: 'new@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Username already exists');
        });
    });

    describe('loginUser', () => {
        beforeEach(() => {
            AuthService.verifyUsernameAndPassword.mockImplementation((username, password) => {
                if (username === 'validuser' && password === 'validpass') {
                    return Promise.resolve({ id: 'userid123', username: 'validuser' });
                }
                return Promise.resolve(null);
            });
            AuthService.generateToken.mockReturnValue('mock-token-123');
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'picturename',
                    username: 'validuser',
                    password: 'validpass'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.headers['set-cookie']).toBeDefined();
        });

        it('should reject login with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'picturename',
                    username: 'invaliduser',
                    password: 'invalidpass'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('logout', () => {
        it('should clear the token cookie', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .send();

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.headers['set-cookie']).toBeDefined();
            expect(response.headers['set-cookie'][0]).toMatch(/token=;/);
        });
    });

    describe('viewProfile & getUserProfile', () => {
        let testUser;

        beforeEach(async () => {
            testUser = await User.create({
                name: 'picturename',
                username: 'profileuser',
                email: 'profile@test.com',
                password: 'password123',
                bio: 'Test bio',
                profilePicture: 'test.jpg'
            });
            testUsers.push(testUser);

            replaceProfilePicPath.mockImplementation((s3, user) => {
                user.profilePicture = 'https://example.com/test.jpg';
                return Promise.resolve();
            });
        });

        it('should return the authenticated user profile', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .send();

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toHaveProperty('username', 'profileuser');
            expect(response.body.user).toHaveProperty('profilePicture', 'https://example.com/test.jpg');
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should return a specific user profile by ID', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser._id}`)
                .send();

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toHaveProperty('username', 'profileuser');
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should return 404 for non-existent user profile', async () => {
            const response = await request(app)
                .get(`/api/users/${new mongoose.Types.ObjectId()}`)
                .send();

            expect(response.status).toBe(404);
        });
    });

    describe('updateProfile', () => {
        let user;

        beforeEach(async () => {
            user = await User.create({
                name: 'picturename',
                username: 'pictureuser',
                email: 'picture@test.com',
                password: 'password123'
            });
            testUsers.push(user);
            uploadToCloud.mockResolvedValue({ filename: 'uploaded-test.jpg' });
        });

        it('should update profile picture successfully', async () => {
            const response = await request(app)
                .put('/api/users/profile/picture')
                .attach('profilePicture', Buffer.from('fake-image'), 'test.jpg');

            const updatedUser = await User.findById(user._id);
        });

        it('should reject update without file', async () => {
            const response = await request(app)
                .put('/api/users/profile/picture')
                .send();

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('No file uploaded');
        });
    });
});