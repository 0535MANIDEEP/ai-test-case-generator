const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const TestCase = require('../models/TestCase');

describe('Export API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await User.deleteMany({});
    const userData = {
      firstName: 'Export',
      lastName: 'Tester',
      email: 'export@example.com',
      password: 'password123'
    };
    const user = await new User(userData).save();
    userId = user._id;

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password });
    token = response.body.token;
  });

  beforeEach(async () => {
    await TestCase.deleteMany({});
  });

  describe('GET /api/export/csv', () => {
    it('should export test cases to CSV', async () => {
      const testCaseData = {
        title: 'CSV Export Test',
        description: 'Test case for CSV export functionality',
        userStory: 'As a user, I want to export test cases to CSV',
        testType: 'functional',
        steps: [
          { stepNumber: 1, action: 'Click export button', expectedResult: 'CSV file is downloaded' }
        ],
        expectedOutput: 'CSV file with test case data',
        createdBy: userId,
        status: 'passed',
        priority: 'high'
      };

      await new TestCase(testCaseData).save();

      const response = await request(app)
        .get('/api/export/csv')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename=test-cases.csv');

      const csvContent = response.text;
      expect(csvContent).toContain('Test Case ID');
      expect(csvContent).toContain('Title');
      expect(csvContent).toContain('Description');
      expect(csvContent).toContain('CSV Export Test');
    });

    it('should return 404 when no test cases exist', async () => {
      const response = await request(app)
        .get('/api/export/csv')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('No test cases found to export');
    });
  });

  describe('GET /api/export/excel', () => {
    it('should export test cases to Excel', async () => {
      const testCaseData = {
        title: 'Excel Export Test',
        description: 'Test case for Excel export functionality',
        userStory: 'As a user, I want to export test cases to Excel',
        testType: 'functional',
        steps: [
          { stepNumber: 1, action: 'Click export button', expectedResult: 'Excel file is downloaded' }
        ],
        expectedOutput: 'Excel file with test case data',
        createdBy: userId,
        status: 'passed',
        priority: 'high'
      };

      await new TestCase(testCaseData).save();

      const response = await request(app)
        .get('/api/export/excel')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .expect('Content-Disposition', 'attachment; filename=test-cases.xlsx');

      // Excel files are binary, so we check for successful response
      expect(response.status).toBe(200);
    });

    it('should return 404 when no test cases exist', async () => {
      const response = await request(app)
        .get('/api/export/excel')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('No test cases found to export');
    });
  });

  describe('POST /api/export/import/csv', () => {
    it('should import test cases from CSV', async () => {
      const csvData = `Title,Description,Test Type,Priority,Expected Output
Test Import,Test case for import functionality,functional,high,Import successful`;

      const response = await request(app)
        .post('/api/export/import/csv')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from(csvData), 'test-cases.csv')
        .expect(201);

      expect(response.body.message).toContain('test cases imported successfully');

      // Verify test cases were created
      const testCases = await TestCase.find({ createdBy: userId });
      expect(testCases.length).toBe(1);
      expect(testCases[0].title).toBe('Test Import');
    });

    it('should return error for invalid CSV file', async () => {
      const response = await request(app)
        .post('/api/export/import/csv')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('invalid,csv,data'), 'test.csv')
        .expect(400);

      expect(response.body.message).toContain('Error parsing CSV file');
    });

    it('should return error when no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/export/import/csv')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.message).toBe('No file uploaded');
    });
  });
});
