const OpenAI = require('openai');
const BaseAIService = require('./BaseAIService');

/**
 * OpenAI Service for generating test cases using OpenAI GPT models
 * Provides high-quality test case generation with advanced AI capabilities
 */
class OpenAIService extends BaseAIService {
  constructor() {
    super('gpt-4');
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.supportedModels = [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-3.5-turbo'
    ];
  }

  /**
   * Generates test cases using OpenAI GPT models
   * @param {string} userStory - The user story to generate test cases for
   * @param {string} testType - Type of test cases (functional, edge, negative)
   * @param {string} complexity - Complexity level (simple, medium, complex)
   * @param {number} count - Number of test cases to generate
   * @returns {Promise<Array>} Array of generated test cases
   * @throws {Error} If API call fails or response is invalid
   */
  async generateTestCases(userStory, testType = 'functional', complexity = 'medium', count = 5) {
    try {
      const prompt = this.buildPrompt(userStory, testType, complexity, count);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a senior QA engineer with expertise in creating comprehensive test cases. Generate test cases in JSON format that can be easily parsed and imported into test management systems."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0].message.content;
      const testCases = this.parseResponse(response, userStory, testType);
      this.validateTestCases(testCases);
      
      return testCases;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Try fallback models if the primary model fails
      if (this.supportedModels.length > 1 && this.model !== this.supportedModels[1]) {
        console.log(`Trying fallback model: ${this.supportedModels[1]}`);
        this.model = this.supportedModels[1];
        return this.generateTestCases(userStory, testType, complexity, count);
      }
      
      throw new Error(`Failed to generate test cases: ${error.message}`);
    }
  }

  /**
   * Sets the model to use for text generation
   * @param {string} modelName - Name of the OpenAI model to use
   */
  setModel(modelName) {
    if (this.supportedModels.includes(modelName)) {
      this.model = modelName;
    } else {
      console.warn(`Model ${modelName} not in supported models list. Using default: ${this.model}`);
    }
  }

  /**
   * Gets the list of supported models
   * @returns {Array} Array of supported model names
   */
  getSupportedModels() {
    return this.supportedModels;
  }
}

module.exports = new OpenAIService();
