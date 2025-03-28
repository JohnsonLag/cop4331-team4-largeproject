const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn().mockReturnValue('test-token')
}));

jest.mock('../../utils/JWTUtils.js', () => ({
  createVerificationToken: jest.fn(() => ({ accessToken: 'test-verification-token', error: '' })),
  createToken: jest.fn(() => 'test-token')
}));

jest.mock('../../utils/sendEmail.js', () => ({
  sendVerificationEmail: jest.fn(() => Promise.resolve())
}));

describe('User API Tests', () => {
  let testUserId;
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    login: `testuser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  afterAll(async () => {
    if (testUserId) {
      try {
        await mongoose.connection.collection('users').deleteOne({ UserId: testUserId });
      } catch (error) {
        console.error('Error cleaning up test user:', error);
      }
    }
    try {
      await mongoose.connection.collection('users').deleteMany({ 
        $or: [
          { Login: testUser.login },
          { Email: testUser.email }
        ]
      });
    } catch (error) {
      console.error('Error cleaning up by login/email:', error);
    }
    await mongoose.connection.close();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/signup')
        .send(testUser);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('error', '');
      
      // Store the user ID for cleanup
      if (response.body.userId && response.body.userId !== -1) {
        testUserId = response.body.userId;
      }
    });

    it('should reject registration with existing username', async () => {
      const response = await request(app)
        .post('/api/signup')
        .send(testUser);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should reject registration with missing required fields', async () => {
      const incompleteUser = {
        firstName: 'Incomplete'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/signup')
        .send(incompleteUser);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with invalid email format', async () => {
      const invalidEmailUser = {
        ...testUser,
        login: `testuser_invalid_email${Date.now()}`,
        email: 'invalid-email-format'
      };

      const response = await request(app)
        .post('/api/signup')
        .send(invalidEmailUser);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid email');
    });
  });

  describe('User Login', () => {
    it('should login successfully with valid credentials', async () => {
      // First ensure the user exists
      if (!testUserId) {
        const registerResponse = await request(app)
          .post('/api/signup')
          .send(testUser);
        
        testUserId = registerResponse.body.userId;
      }

      const response = await request(app)
        .post('/api/login')
        .send({
          login: testUser.login,
          password: testUser.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('error', '');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          login: testUser.login,
          password: 'WrongPassword123!'
        });
      
      expect(response.status).toBe(200); 
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Login/Password incorrect');
    });

    it('should reject login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          login: 'nonexistentuser',
          password: 'AnyPassword123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('error');
    });
  });
});