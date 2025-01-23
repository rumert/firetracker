const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/user');
const { default: mongoose } = require('mongoose');

jest.mock('../../src/models/user');
jest.mock('../../src/models/refreshToken');
jest.mock('../../src/utils/functions', () => ({
  createUser: jest.fn(),
  generateAccessToken: jest.fn(() => ({ accessToken: 'fakeAccessToken', maxAge: 3600 })),
  generateRefreshToken: jest.fn(() => ({ refreshToken: 'fakeRefreshToken', maxAge: 7200 })),
}));

describe('Auth Routes', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });
  describe('POST /login', () => {
    it('should return 200 and set cookies when login is successful', async () => {
      const mockUser = { id: '123', nickname: 'testuser', password_hash: 'hashedPassword' };
      User.findOne.mockResolvedValue(mockUser);

      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      const response = await request(app)
        .post('/login')
        .send({ nickname: 'testuser', password: 'Password123' });

      expect(response.status).toBe(200);
      expect(response.body?.refreshToken).toBeDefined()
      expect(response.body?.accessToken).toBeDefined()
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 when password is incorrect', async () => {
      const mockUser = { id: '123', nickname: 'testuser', password_hash: 'hashedPassword' };
      User.findOne.mockResolvedValue(mockUser);

      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      const response = await request(app)
        .post('/login')
        .send({ nickname: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Wrong password');
    });

    it('should return 404 when user does not exist', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/login')
        .send({ nickname: 'unknownuser', password: 'password' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No user with this nickname found.');
    });
  });

  describe('POST /register', () => {
    it('should return 200 and set cookies when registration is successful', async () => {
      User.findOne.mockResolvedValue(null);
      const mockUser = { id: '123', nickname: 'newuser', email: 'email@test.com' };
      require('../../src/utils/functions').createUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/register')
        .send({ nickname: 'newuser', email: 'email@test.com', password: 'Password123' });

      expect(response.status).toBe(200);
      expect(response.body?.refreshToken).toBeDefined()
      expect(response.body?.accessToken).toBeDefined()
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 409 when email or nickname already exists', async () => {
      const mockUser = { id: '123', nickname: 'existinguser', email: 'email@test.com' };
      User.findOne.mockResolvedValue(mockUser);

      const response_1 = await request(app)
        .post('/register')
        .send({ nickname: 'existinguser', email: 'differentEmail@test.com', password: 'Password123' });
      
      expect(response_1.status).toBe(409);
      expect(response_1.body.error).toBe('Email/Nickname already exists. Please use a different email or login.');

      const response_2 = await request(app)
        .post('/register')
        .send({ nickname: 'differentuser', email: 'Email@test.com', password: 'Password123' });

      expect(response_2.status).toBe(409);
      expect(response_2.body.error).toBe('Email/Nickname already exists. Please use a different email or login.');
    });
  });

  describe('GET /token', () => {
    it('should return a new access token when refresh token is valid', async () => {
      const mockUser = { nickname: 'testuser', uid: '123' };
      jest.spyOn(require('jsonwebtoken'), 'verify').mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      const response = await request(app)
        .get('/token')
        .set('Authorization', 'Bearer validRefreshToken');

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBe('fakeAccessToken');
    });

    it('should return 403 when refresh token is invalid', async () => {
      jest.spyOn(require('jsonwebtoken'), 'verify').mockImplementation((token, secret, callback) => {
        callback(new Error('Forbidden'), null);
      });

      const response = await request(app)
        .get('/token')
        .set('Authorization', 'Bearer invalidRefreshToken');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });
  });
});
