const request = require('supertest');
const express = require('express');
const accountRouter = require('../routes/accountRouter'); // Adjust path as needed
const { AuthorizeUser } = require('../services/authService');
const controller = require('../controllers/accountController');

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
  EscapeRegister: jest.fn((req, res, next) => next()),
  EscapeLogin: jest.fn((req, res, next) => next()),
}));

jest.mock('../services/fileService', () => ({
  uploadToMemory: { none: jest.fn().mockReturnThis(), single: jest.fn().mockReturnThis() },
}));

jest.mock('../controllers/accountController', () => ({
  authCheck: jest.fn((req, res) => res.status(200).send('Authenticated')),
  search: jest.fn((req, res) => res.status(200).json([{ username: 'testUser' }])),
  register: jest.fn((req, res) => res.status(201).send('User registered')),
  loginUser: jest.fn((req, res) => res.status(200).send('User logged in')),
  logout: jest.fn((req, res) => res.status(200).send('User logged out')),
  viewProfile: jest.fn((req, res) => res.status(200).json({ username: 'testUser' })),
  updateProfile: jest.fn((req, res) => res.status(200).send('Profile updated')),
  getUserProfile: jest.fn((req, res) => res.status(200).json({ username: 'testUser', profilePic: 'imageUrl' })),
}));

describe('Account Router', () => {
  const app = express();
  app.use(express.json());
  app.use('/account', accountRouter);

  test('GET /auth-check should return 200 if user is authenticated', async () => {
    const response = await request(app).get('/account/auth-check');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Authenticated');
  });

  test('GET /search should return users matching the query', async () => {
    const response = await request(app).get('/account/search?query=test');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ username: 'testUser' }]);
  });

  test('POST /register should create a new user', async () => {
    const response = await request(app)
      .post('/account/register')
      .send({ username: 'newUser', password: 'password' });

    expect(response.status).toBe(201);
    expect(response.text).toBe('User registered');
  });

  test('POST /login should authenticate the user', async () => {
    const response = await request(app)
      .post('/account/login')
      .send({ username: 'testUser', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.text).toBe('User logged in');
  });

  test('POST /logout should log the user out', async () => {
    const response = await request(app).post('/account/logout');
    expect(response.status).toBe(200);
    expect(response.text).toBe('User logged out');
  });

  test('GET /profile should return the profile data for authenticated user', async () => {
    const response = await request(app).get('/account/profile');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ username: 'testUser' });
  });

  test('POST /profile should update the profile picture for authenticated user', async () => {
    const response = await request(app)
      .post('/account/profile')
      .attach('profilePic', 'path/to/image.jpg'); // Adjust image path accordingly

    expect(response.status).toBe(200);
    expect(response.text).toBe('Profile updated');
  });

  test('GET /profile/:id should return user profile by ID', async () => {
    const response = await request(app).get('/account/profile/123');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ username: 'testUser', profilePic: 'imageUrl' });
  });
});