const request = require('supertest');
const app = require('../../src/server'); // Your main Express app
const User = require('../../src/models/user');
const RefreshToken = require('../../src/models/refreshToken');

// Mock necessary functions and models
jest.mock('../../src/models/user');
jest.mock('../../src/models/refreshToken');
jest.mock('../../src/utils/functions', () => ({
  createUser: jest.fn(),
  generateAccessToken: jest.fn(() => ({ accessToken: 'fakeAccessToken', maxAge: 3600 })),
  generateRefreshToken: jest.fn(() => ({ refreshToken: 'fakeRefreshToken', maxAge: 7200 })),
}));

describe('Auth Routes', () => {
  describe('POST /login', () => {
    it('should return 200 and set cookies when login is successful', async () => {
      // Arrange
      const mockUser = { id: '123', nickname: 'testuser', password_hash: 'hashedPassword' };
      User.findOne.mockResolvedValue(mockUser);

      // Mock bcrypt comparison
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      // Act
      const response = await request(app)
        .post('/login')
        .send({ nickname: 'testuser', password: 'password' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toBe('OK');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 403 when password is incorrect', async () => {
      // Arrange
      const mockUser = { id: '123', nickname: 'testuser', password_hash: 'hashedPassword' };
      User.findOne.mockResolvedValue(mockUser);

      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post('/login')
        .send({ nickname: 'testuser', password: 'wrongpassword' });

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Wrong password');
    });

    it('should return 404 when user does not exist', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/login')
        .send({ nickname: 'unknownuser', password: 'password' });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No user with this nickname found.');
    });
  });

  describe('POST /register', () => {
    it('should return 200 and set cookies when registration is successful', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null); // No existing user
      const mockUser = { id: '123', nickname: 'newuser', email: 'email@test.com' };
      require('../../utils/functions').createUser.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/register')
        .send({ nickname: 'newuser', email: 'email@test.com', password: 'password123' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toBe('OK');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 409 when email or nickname already exists', async () => {
      // Arrange
      const mockUser = { id: '123', nickname: 'existinguser', email: 'email@test.com' };
      User.findOne.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/register')
        .send({ nickname: 'existinguser', email: 'email@test.com', password: 'password123' });

      // Assert
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email/Nickname already exists. Please use a different email or login.');
    });
  });

  describe('GET /token', () => {
    it('should return a new access token when refresh token is valid', async () => {
      // Arrange
      const mockUser = { nickname: 'testuser', uid: '123' };
      jest.spyOn(require('jsonwebtoken'), 'verify').mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      // Act
      const response = await request(app)
        .get('/token')
        .set('Authorization', 'Bearer validRefreshToken');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBe('fakeAccessToken');
    });

    it('should return 403 when refresh token is invalid', async () => {
      // Arrange
      jest.spyOn(require('jsonwebtoken'), 'verify').mockImplementation((token, secret, callback) => {
        callback(new Error('Forbidden'), null);
      });

      // Act
      const response = await request(app)
        .get('/token')
        .set('Authorization', 'Bearer invalidRefreshToken');

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });
  });
});
