const OpenAIService = require('../services/openaiService');
const OpenAI = require('openai');

// Mock OpenAI API
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify([{
                  title: 'Test Login Functionality',
                  description: 'Test user login with valid credentials',
                  steps: [
                    { stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login page loads successfully' },
                    { stepNumber: 2, action: 'Enter valid email and password', expectedResult: 'Credentials are accepted' },
                    { stepNumber: 3, action: 'Click login button', expectedResult: 'User is redirected to dashboard' }
                  ],
                  expectedOutput: 'User should be logged in successfully and redirected to dashboard',
                  priority: 'high',
                  testData: 'Valid email: test@example.com, password: Password123'
                }])
              }
            }]
          })
        }
      }
    };
  });
});

// Increase timeout for tests
jest.setTimeout(20000);

describe('OpenAIService', () => {
  let mockOpenAI;

  beforeEach(() => {
    // Reset the mock implementation before each test
    mockOpenAI = require('openai');
    jest.clearAllMocks();
  });

  describe('generateTestCases', () => {
    it('should generate test cases from user story', async () => {
      const userStory = 'As a user, I want to login to my account';
      const testType = 'functional';
      const complexity = 'medium';
      const count = 1;

      const testCases = await OpenAIService.generateTestCases(userStory, testType, complexity, count);

      expect(testCases).toBeInstanceOf(Array);
      expect(testCases.length).toBe(1);
      expect(testCases[0]).toHaveProperty('title');
      expect(testCases[0]).toHaveProperty('description');
      expect(testCases[0]).toHaveProperty('steps');
      expect(testCases[0]).toHaveProperty('expectedOutput');
      expect(testCases[0].userStory).toBe(userStory);
      expect(testCases[0].testType).toBe(testType);
      expect(testCases[0].aiGenerated).toBe(true);
    });

    it('should handle different test types', async () => {
      const userStory = 'As a user, I want to login to my account';
      
      const functionalCases = await OpenAIService.generateTestCases(userStory, 'functional', 'medium', 1);
      const edgeCases = await OpenAIService.generateTestCases(userStory, 'edge', 'medium', 1);
      const negativeCases = await OpenAIService.generateTestCases(userStory, 'negative', 'medium', 1);

      expect(functionalCases[0].testType).toBe('functional');
      expect(edgeCases[0].testType).toBe('edge');
      expect(negativeCases[0].testType).toBe('negative');
    });

    it('should handle invalid JSON response', async () => {
      // Mock invalid JSON response
      mockOpenAI.mockImplementationOnce(() => {
        return {
          chat: {
            completions: {
              create: jest.fn().mockResolvedValue({
                choices: [{
                  message: {
                    content: 'invalid json'
                  }
                }]
              })
            }
          }
        };
      });

      await expect(OpenAIService.generateTestCases('test story', 'functional', 'medium', 1))
        .rejects
        .toThrow('Invalid response format from AI service');
    });

    it('should validate generated test cases', async () => {
      // Mock incomplete test case data
      mockOpenAI.mockImplementationOnce(() => {
        return {
          chat: {
            completions: {
              create: jest.fn().mockResolvedValue({
                choices: [{
                  message: {
                    content: JSON.stringify([
                      {
                        title: 'Incomplete Test Case',
                        // Missing required fields
                      }
                    ])
                  }
                }]
              })
            }
          }
        };
      });

      await expect(OpenAIService.generateTestCases('test story', 'functional', 'medium', 1))
        .rejects
        .toThrow('Validation failed');
    });
  });

  describe('buildPrompt', () => {
    it('should build functional test prompt correctly', () => {
      const prompt = OpenAIService.buildPrompt('test story', 'functional', 'medium', 3);
      expect(prompt).toContain('functional test cases');
      expect(prompt).toContain('test story');
      expect(prompt).toContain('medium');
      expect(prompt).toContain('3');
    });

    it('should build edge case prompt correctly', () => {
      const prompt = OpenAIService.buildPrompt('test story', 'edge', 'complex', 2);
      expect(prompt).toContain('edge case');
      expect(prompt).toContain('complex');
    });

    it('should build negative test prompt correctly', () => {
      const prompt = OpenAIService.buildPrompt('test story', 'negative', 'simple', 1);
      expect(prompt).toContain('negative test cases');
      expect(prompt).toContain('simple');
    });
  });

  describe('parseResponse', () => {
    it('should parse valid JSON response', () => {
      const response = JSON.stringify([
        {
          title: 'Test Case',
          description: 'Test description',
          steps: [{ stepNumber: 1, action: 'test', expectedResult: 'result' }],
          expectedOutput: 'expected output'
        }
      ]);

      const parsed = OpenAIService.parseResponse(response, 'user story', 'functional');
      expect(parsed).toBeInstanceOf(Array);
      expect(parsed[0].title).toBe('Test Case');
    });

    it('should clean markdown code blocks from response', () => {
      const response = '```json\n' + JSON.stringify([{ title: 'Test Case' }]) + '\n```';
      const parsed = OpenAIService.parseResponse(response, 'user story', 'functional');
      expect(parsed[0].title).toBe('Test Case');
    });

    it('should throw error for invalid JSON', () => {
      expect(() => {
        OpenAIService.parseResponse('invalid json', 'user story', 'functional');
      }).toThrow('Invalid response format from AI service');
    });
  });

  describe('estimateTime', () => {
    it('should estimate time based on complexity', () => {
      expect(OpenAIService.estimateTime('simple')).toBe(15);
      expect(OpenAIService.estimateTime('medium')).toBe(30);
      expect(OpenAIService.estimateTime('complex')).toBe(60);
      expect(OpenAIService.estimateTime('unknown')).toBe(30);
    });
  });
});
