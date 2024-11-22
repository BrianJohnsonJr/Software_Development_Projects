const request = require('supertest');
const express = require('express');
const session = require('express-session');

// Create express app
const app = express();

// Configure higher timeout for tests if needed
jest.setTimeout(10000); // 10 second timeout

// Consolidated mock setup
const setupMocks = () => {
  // Service mocks
  jest.mock('../services/authService', () => ({
    AuthorizeUser: jest.fn((req, res, next) => next())
  }));

  jest.mock('../services/fileService', () => ({
    uploadToMemory: {
      none: jest.fn(() => (req, res, next) => next()),
      single: jest.fn(() => (req, res, next) => {
        req.file = {
          buffer: Buffer.from('mock-file-content'),
          originalname: 'test.jpg',
          mimetype: 'image/jpeg'
        };
        next();
      })
    }
  }));

  jest.mock('../services/verifyService', () => ({
    VerifyParamsId: jest.fn((req, res, next) => next()),
    VerifyLastId: jest.fn((req, res, next) => next()),
    VerifyS3: jest.fn((req, res, next) => next()),
    SanitizeSearch: jest.fn((req, res, next) => next()),
    VerifyValidationResult: jest.fn((req, res, next) => next()),
    EscapeRegister: jest.fn((req, res, next) => next()),
    EscapeLogin: jest.fn((req, res, next) => next())
  }));

  // Controller mocks with immediate response implementations
  jest.mock('../controllers/accountController', () => ({
    authCheck: jest.fn((req, res) => res.json({ authenticated: true })),
    search: jest.fn((req, res) => res.json({ users: [] })),
    register: jest.fn((req, res) => res.status(201).json({ message: 'Success' })),
    loginUser: jest.fn((req, res) => res.json({ message: 'Success' })),
    logout: jest.fn((req, res) => res.json({ message: 'Success' })),
    viewProfile: jest.fn((req, res) => res.json({})),
    updateProfile: jest.fn((req, res) => res.json({})),
    getUserProfile: jest.fn((req, res) => res.json({}))
  }));
};

// Import dependencies
const initializeApp = () => {
  const { AuthorizeUser } = require('../services/authService');
  const { uploadToMemory } = require('../services/fileService');
  const verifyService = require('../services/verifyService');
  const controller = require('../controllers/accountController');
  const accountRouter = require('../routes/accountRouter');

  // Setup express app
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false
  }));
  app.use('/api/account', accountRouter);

  return {
    AuthorizeUser,
    uploadToMemory,
    verifyService,
    controller
  };
};

describe('Account Routes', () => {
  let deps;

  beforeAll(() => {
    setupMocks();
    deps = initializeApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Group related tests together
  describe('Authentication Endpoints', () => {
    describe('GET /api/account/auth-check', () => {
      it('should check authentication status', async () => {
        await request(app)
          .get('/api/account/auth-check')
          .expect(200)
          .expect('Content-Type', /json/);

        expect(deps.AuthorizeUser).toHaveBeenCalled();
        expect(deps.controller.authCheck).toHaveBeenCalled();
      });
    });

    describe('POST /api/account/login', () => {
      const validCredentials = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      it('should handle login request', async () => {
        await request(app)
          .post('/api/account/login')
          .send(validCredentials)
          .expect(200)
          .expect('Content-Type', /json/);
      });
    });

    describe('POST /api/account/logout', () => {
      it('should handle logout request', async () => {
        await request(app)
          .post('/api/account/logout')
          .expect(200)
          .expect('Content-Type', /json/);
      });
    });
  });

  // Profile management endpoints
  describe('Profile Management Endpoints', () => {
    describe('POST /api/account/profile', () => {
      it('should handle profile update with image', async () => {
        await request(app)
          .post('/api/account/profile')
          .attach('profilePic', Buffer.from('fake-image-data'), 'profile.jpg')
          .expect(200)
          .expect('Content-Type', /json/);

        expect(deps.AuthorizeUser).toHaveBeenCalled();
      });
    });

    describe('GET /api/account/profile/:id', () => {
      it('should fetch user profile', async () => {
        await request(app)
          .get('/api/account/profile/1')
          .expect(200)
          .expect('Content-Type', /json/);

        expect(deps.verifyService.VerifyParamsId).toHaveBeenCalled();
        expect(deps.verifyService.VerifyS3).toHaveBeenCalled();
      });
    });
  });

  // User management endpoints
  describe('User Management Endpoints', () => {
    describe('POST /api/account/register', () => {
      const validUser = {
        username: 'newuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      it('should handle user registration', async () => {
        await request(app)
          .post('/api/account/register')
          .send(validUser)
          .expect(201)
          .expect('Content-Type', /json/);

        expect(deps.verifyService.EscapeRegister).toHaveBeenCalled();
      });
    });

    describe('GET /api/account/search', () => {
      it('should handle user search', async () => {
        await request(app)
          .get('/api/account/search')
          .query({ q: 'test' })
          .expect(200)
          .expect('Content-Type', /json/);

        expect(deps.verifyService.SanitizeSearch).toHaveBeenCalled();
        expect(deps.verifyService.VerifyValidationResult).toHaveBeenCalled();
      });
    });
  });
});