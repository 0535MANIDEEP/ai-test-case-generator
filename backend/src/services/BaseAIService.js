/**
 * Base class for AI services that generate test cases
 * Provides common functionality for prompt building, response parsing, and validation
 */
class BaseAIService {
  constructor(modelName) {
    this.model = modelName;
  }

  /**
   * Builds a prompt for generating test cases based on user story and parameters
   * @param {string} userStory - The user story to generate test cases for
   * @param {string} testType - Type of test cases (functional, edge, negative)
   * @param {string} complexity - Complexity level (simple, medium, complex)
   * @param {number} count - Number of test cases to generate
   * @returns {string} The formatted prompt
   */
  buildPrompt(userStory, testType = 'functional', complexity = 'medium', count = 5) {
    const promptTemplates = {
      functional: `Generate ${count} comprehensive functional test cases for the following user story. 
      Consider different scenarios, inputs, and expected outcomes. Format the response as a JSON array of test cases.

      User Story: "${userStory}"
      
      Each test case should include:
      - title: Descriptive title
      - description: Detailed description of what is being tested
      - steps: Array of step objects with stepNumber, action, and expectedResult
      - preconditions: Array of prerequisites
      - expectedOutput: Expected result
      - priority: high/medium/low
      - testData: Required test data
      
      Complexity level: ${complexity}
      
      Return only valid JSON, no additional text.`,

      edge: `Generate ${count} edge case test scenarios for the following user story. 
      Focus on boundary conditions, extreme values, and unusual scenarios. Format as JSON array.

      User Story: "${userStory}"
      
      Each edge case should include:
      - title: Descriptive title indicating it's an edge case
      - description: Explanation of the edge condition
      - steps: Test steps
      - expectedOutput: What should happen in this edge case
      - priority: Typically high for edge cases
      
      Complexity: ${complexity}
      
      Return only valid JSON.`,

      negative: `Generate ${count} negative test cases for the following user story. 
      Focus on invalid inputs, error conditions, and failure scenarios. Format as JSON array.

      User Story: "${userStory}"
      
      Each negative test case should include:
      - title: Descriptive title indicating negative scenario
      - description: What invalid condition is being tested
      - steps: Steps to reproduce the negative scenario
      - expectedOutput: Expected error message or behavior
      - priority: Usually medium to high
      
      Complexity: ${complexity}
      
      Return only valid JSON.`
    };

    return promptTemplates[testType] || promptTemplates.functional;
  }

  /**
   * Parses the AI response and enhances test cases with metadata
   * @param {string} response - Raw response from AI service
   * @param {string} userStory - Original user story
   * @param {string} testType - Type of test cases generated
   * @returns {Array} Array of enhanced test cases
   * @throws {Error} If response cannot be parsed or is invalid
   */
  parseResponse(response, userStory, testType) {
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanResponse = response.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      
      const testCases = JSON.parse(cleanResponse);
      
      if (!Array.isArray(testCases)) {
        throw new Error('Expected array of test cases');
      }

      // Enhance test cases with additional metadata
      return testCases.map((testCase, index) => ({
        ...testCase,
        userStory,
        testType,
        aiGenerated: true,
        aiModel: this.model,
        status: 'not_started',
        steps: testCase.steps || [],
        preconditions: testCase.preconditions || [],
        postconditions: testCase.postconditions || [],
        tags: testCase.tags || [`ai-generated`, testType],
        priority: testCase.priority || 'medium',
        estimatedTime: this.estimateTime(testCase.complexity || 'medium')
      }));
    } catch (error) {
      console.error(`Failed to parse AI response from ${this.model}:`, error);
      throw new Error('Invalid response format from AI service');
    }
  }

  /**
   * Estimates time required to execute a test case based on complexity
   * @param {string} complexity - Complexity level (simple, medium, complex)
   * @returns {number} Estimated time in minutes
   */
  estimateTime(complexity) {
    const timeEstimates = {
      simple: 15,
      medium: 30,
      complex: 60
    };
    return timeEstimates[complexity] || 30;
  }

  /**
   * Validates generated test cases for required fields
   * @param {Array} testCases - Array of test cases to validate
   * @returns {boolean} True if validation passes
   * @throws {Error} If validation fails with detailed error messages
   */
  validateTestCases(testCases) {
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

module.exports = BaseAIService;
