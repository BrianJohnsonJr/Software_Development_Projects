const request = require('supertest'); // For HTTP assertions
const express = require('express');
const accountRouter = require('../routes/accountRouter');
const { AuthService } = require('../services/authService');

// Mock the database model
jest.mock('../models/users', () => ({
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndDelete: jest.fn(),
    save: jest.fn(),
}));

const User = require('../models/users');

// Mock the AuthService methods
jest.mock('../services/authService', () => ({
    AuthService: {
        verifyPassword: jest.fn(),
        hashPassword: jest.fn(),
    },
    AuthorizeUser: jest.fn((req, res, next) => {
        req.user = { id: 'mockUserId' }; // Mock user ID
        next();
    }),
}));

// Setup Express app
const app = express();
app.use(express.json());
app.use('/account', accountRouter);

describe('Account Router Tests', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should return account settings', async () => {
        User.findById.mockResolvedValue({
            name: 'Test User',
            username: 'testuser',
            email: 'test@example.com',
            bio: 'This is a bio.',
            profilePicture: 'profile.jpg',
        });

        const res = await request(app).get('/account/settings');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.user).toHaveProperty('username', 'testuser');
    });

    it('should return 404 if user not found in settings', async () => {
        User.findById.mockResolvedValue(null); // No user found

        const res = await request(app).get('/account/settings');

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('success', false);
    });

    it('should update account details', async () => {
        User.findById.mockResolvedValue({
            save: jest.fn(),
            username: 'oldUsername',
            email: 'old@example.com',
        });

        User.findOne.mockResolvedValue(null); // No conflicting usernames or emails

        const res = await request(app)
            .put('/account/update')
            .send({ username: 'newUsername', email: 'new@example.com' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });

    it('should change the password successfully', async () => {
        User.findById.mockResolvedValue({
            password: 'hashedPassword',
            save: jest.fn(),
        });

        AuthService.verifyPassword.mockResolvedValue(true); // Current password matches
        AuthService.hashPassword.mockResolvedValue('newHashedPassword'); // New password hashed

        const res = await request(app)
            .put('/account/change-password')
            .send({ currentPassword: 'currentPass', newPassword: 'newPass' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });

    it('should delete the account successfully', async () => {
        User.findByIdAndDelete.mockResolvedValue(true); // Account deleted

        const res = await request(app).delete('/account/delete');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });
});