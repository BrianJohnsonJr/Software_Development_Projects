const request = require('supertest');
const app = require('../app');
const { User } = require('../models/users');
const { AuthService } = require('../services/authService');
const { uploadToCloud } = require('../services/fileService');

// Mocking the services
jest.mock('../models/users');
jest.mock('../services/authService');
jest.mock('../services/fileService');

describe('Account Controller Tests', () => {

    let user;

    beforeAll(() => {
        // Setup mock user data
        user = { _id: '123', username: 'testuser', email: 'test@example.com', password: 'hashedpassword' };
    });

    beforeEach(() => {
        // Reset mocks before each test
        User.findById.mockClear();
        User.find.mockClear();
        AuthService.verifyUsernameAndPassword.mockClear();
        AuthService.generateToken.mockClear();
    });

    test('GET /auth-check - should return user info if authenticated', async () => {
        // Mocking the User.findById behavior
        User.findById.mockResolvedValue(user);

        const res = await request(app)
            .get('/auth-check')
            .set('Cookie', 'token=validtoken') // Assuming token is set in cookies
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.user).toEqual({ username: 'testuser', email: 'test@example.com' });
    });

    test('GET /auth-check - should return error if user not found', async () => {
        // Mocking the User.findById behavior to return null (user not found)
        User.findById.mockResolvedValue(null);

        const res = await request(app)
            .get('/auth-check')
            .set('Cookie', 'token=validtoken')
            .expect(404);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User not found');
    });

    test('POST /login - should log in the user and return a token', async () => {
        // Mocking the AuthService to return a user
        AuthService.verifyUsernameAndPassword.mockResolvedValue(user);
        AuthService.generateToken.mockReturnValue('fake-jwt-token');

        const res = await request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'password' })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.token).toBe('fake-jwt-token');
    });

    test('POST /login - should return error if credentials are incorrect', async () => {
        // Mocking the AuthService to return null for invalid credentials
        AuthService.verifyUsernameAndPassword.mockResolvedValue(null);

        const res = await request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'wrongpassword' })
            .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid username or password');
    });

    test('POST /register - should register a new user', async () => {
        // Mocking the User.save behavior
        User.findOne.mockResolvedValue(null); // No existing user
        User.prototype.save.mockResolvedValue(user);

        const res = await request(app)
            .post('/register')
            .send({
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password',
                name: 'New User',
                bio: 'Bio here',
            })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User registered successfully');
    });

    test('POST /register - should return error if username or email exists', async () => {
        // Mocking the User.findOne behavior to return an existing user
        User.findOne.mockResolvedValue(user);

        const res = await request(app)
            .post('/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password',
                name: 'New User',
                bio: 'Bio here',
            })
            .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Username already exists');
    });

    test('POST /profile - should update profile picture', async () => {
        // Mocking file upload and profile update behavior
        uploadToCloud.mockResolvedValue({ filename: 'newpic.jpg' });
        User.findById.mockResolvedValue(user);

        const res = await request(app)
            .post('/profile')
            .set('Cookie', 'token=validtoken')
            .attach('profilePic', 'path/to/profilePic.jpg') // Assuming you're using multer or similar for file upload
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Profile picture updated successfully');
    });

    test('POST /profile - should return error if no file is uploaded', async () => {
        // No file uploaded
        const res = await request(app)
            .post('/profile')
            .set('Cookie', 'token=validtoken')
            .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('No file uploaded');
    });
});