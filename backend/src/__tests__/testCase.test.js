const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const TestCase = require('../models/TestCase');

describe('TestCase API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await User.deleteMany({});
    const userData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'password123'
    };
    const user = await new User(userData).save();
    userId = user._id;

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password });
    token = response.body.token;
    console.log('Generated Token:', token);
  });

  beforeEach(async () => {
    await TestCase.deleteMany({});
  });

  describe('POST /api/test-cases', () => {
    it('should create a new test case successfully', async () => {
      const testCaseData = {
        title: 'Login Test Case',
        description: 'Test case for user login functionality',
        userStory: 'As a user, I want to log in to my account',
        testType: 'functional',
        steps: [
          { stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login page is displayed' },
          { stepNumber: 2, action: 'Enter valid credentials', expectedResult: 'User is logged in' }
        ],
        expectedOutput: 'User dashboard is displayed',
        createdBy: userId
      };

      const response = await request(app)
        .post('/api/test-cases')
        .set('Authorization', `Bearer ${token}`)
        .send(testCaseData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(testCaseData.title);
      expect(response.body.description).toBe(testCaseData.description);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/test-cases')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/test-cases', () => {
    it('should return all test cases for the user', async () => {
      const testCaseData = {
        title: 'Login Test Case',
        description: 'Test case for user login functionality',
        userStory: 'As a user, I want to log in to my account',
        testType: 'functional',
        steps: [
          { stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login page is displayed' },
          { stepNumber: 2, action: 'Enter valid credentials', expectedResult: 'User is logged in' }
        ],
        expectedOutput: 'User dashboard is displayed',
        createdBy: userId
      };

      await new TestCase(testCaseData).save();

      const response = await request(app)
        .get('/api/test-cases')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe(testCaseData.title);
    });
  });

  describe('GET /api/test-cases/:id', () => {
    it('should return a single test case by ID', async () => {
      const testCaseData = {
        title: 'Login Test Case',
        description: 'Test case for user login functionality',
        userStory: 'As a user, I want to log in to my account',
        testType: 'functional',
        steps: [
          { stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login page is displayed' },
          { stepNumber: 2, action: 'Enter valid credentials', expectedResult: 'User is logged in' }
        ],
        expectedOutput: 'User dashboard is displayed',
        createdBy: userId
      };

      const testCase = await new TestCase(testCaseData).save();

      const response = await request(app)
        .get(`/api/test-cases/${testCase._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.title).toBe(testCaseData.title);
    });

    it('should return 404 for non-existing test case', async () => {
      const response = await request(app)
        .get('/api/test-cases/invalidid')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('Test case not found');
    });
  });

  describe('DELETE /api/test-cases/:id', () => {
    it('should delete a test case by ID', async () => {
      const testCaseData = {
        title: 'Login Test Case',
        description: 'Test case for user login functionality',
        userStory: 'As a user, I want to log in to my account',
        testType: 'functional',
        steps: [
          { stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login page is displayed' },
          { stepNumber: 2, action: 'Enter valid credentials', expectedResult: 'User is logged in' }
        ],
        expectedOutput: 'User dashboard is displayed',
        createdBy: userId
      };

      const testCase = await new TestCase(testCaseData).save();

      await request(app)
        .delete(`/api/test-cases/${testCase._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const deletedTestCase = await TestCase.findById(testCase._id);
      expect(deletedTestCase).toBeNull();
    });

    it('should return 404 for non-existing test case', async () => {
      const response = await request(app)
        .delete('/api/test-cases/invalidid')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('Test case not found');
    });
  });
});
