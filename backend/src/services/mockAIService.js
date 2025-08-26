class MockAIService {
  constructor() {
    this.model = 'mock-ai-service';
  }

  async generateTestCases(userStory, testType = 'functional', complexity = 'medium', count = 5) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponses = {
        functional: this.generateFunctionalTestCases(userStory, count),
        edge: this.generateEdgeTestCases(userStory, count),
        negative: this.generateNegativeTestCases(userStory, count)
      };

      return mockResponses[testType] || mockResponses.functional;
    } catch (error) {
      console.error('Mock AI Service Error:', error);
      throw new Error(`Failed to generate test cases: ${error.message}`);
    }
  }

  generateFunctionalTestCases(userStory, count) {
    const testCases = [];
    for (let i = 1; i <= count; i++) {
      testCases.push({
        title: `Functional Test ${i} - ${userStory.substring(0, 30)}...`,
        description: `Test the main functionality described in: ${userStory}`,
        steps: [
          {
            stepNumber: 1,
            action: 'Navigate to the application',
            expectedResult: 'Application loads successfully'
          },
          {
            stepNumber: 2,
            action: 'Perform the main action',
            expectedResult: 'Action completes as expected'
          },
          {
            stepNumber: 3,
            action: 'Verify the results',
            expectedResult: 'Results match expected outcome'
          }
        ],
        preconditions: ['System is available', 'User has necessary permissions'],
        expectedOutput: 'Successful completion of the user story functionality',
        priority: 'high',
        testData: 'Sample test data for validation',
        userStory,
        testType: 'functional',
        aiGenerated: true,
        aiModel: this.model,
        status: 'not_started',
        tags: ['ai-generated', 'functional', 'automated'],
        estimatedTime: 30
      });
    }
    return testCases;
  }

  generateEdgeTestCases(userStory, count) {
    const testCases = [];
    for (let i = 1; i <= count; i++) {
      testCases.push({
        title: `Edge Case ${i} - Boundary condition testing`,
        description: `Test boundary conditions for: ${userStory}`,
        steps: [
          {
            stepNumber: 1,
            action: 'Set up extreme input values',
            expectedResult: 'System handles boundary values correctly'
          },
          {
            stepNumber: 2,
            action: 'Execute with limit conditions',
            expectedResult: 'System behaves as expected at limits'
          }
        ],
        preconditions: ['System is in normal state'],
        expectedOutput: 'Proper handling of edge cases',
        priority: 'high',
        testData: 'Boundary value data sets',
        userStory,
        testType: 'edge',
        aiGenerated: true,
        aiModel: this.model,
        status: 'not_started',
        tags: ['ai-generated', 'edge', 'boundary'],
        estimatedTime: 45
      });
    }
    return testCases;
  }

  generateNegativeTestCases(userStory, count) {
    const testCases = [];
    for (let i = 1; i <= count; i++) {
      testCases.push({
        title: `Negative Test ${i} - Error condition testing`,
        description: `Test error handling for: ${userStory}`,
        steps: [
          {
            stepNumber: 1,
            action: 'Provide invalid input data',
            expectedResult: 'System detects and handles invalid input'
          },
          {
            stepNumber: 2,
            action: 'Attempt invalid operations',
            expectedResult: 'System prevents invalid operations gracefully'
          }
        ],
        preconditions: ['System is operational'],
        expectedOutput: 'Proper error messages and handling',
        priority: 'medium',
        testData: 'Invalid input data samples',
        userStory,
        testType: 'negative',
        aiGenerated: true,
        aiModel: this.model,
        status: 'not_started',
        tags: ['ai-generated', 'negative', 'error-handling'],
        estimatedTime: 35
      });
    }
    return testCases;
  }

  async validateTestCases(testCases) {
    const errors = [];
    
    testCases.forEach((testCase, index) => {
      if (!testCase.title) {
        errors.push(`Test case ${index + 1}: Title is required`);
      }
      if (!testCase.expectedOutput) {
        errors.push(`Test case ${index + 1}: Expected output is required`);
      }
      if (!testCase.steps || testCase.steps.length === 0) {
        errors.push(`Test case ${index + 1}: At least one test step is required`);
      }
    });

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join('; ')}`);
    }

    return true;
  }
}

module.exports = new MockAIService();
