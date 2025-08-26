const { HfInference } = require('@huggingface/inference');
const BaseAIService = require('./BaseAIService');

/**
 * HuggingFace Service for generating test cases using HuggingFace Inference API
 * Supports both free and paid models with fallback mechanisms
 */
class HuggingFaceService extends BaseAIService {
  constructor() {
    super('microsoft/DialoGPT-small'); // Default model for free tier
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    this.supportedModels = [
      'microsoft/DialoGPT-small',
      'distilgpt2',
      'gpt2',
      'microsoft/DialoGPT-medium'
    ];
  }

  /**
   * Generates test cases using HuggingFace Inference API
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
      
      const response = await this.hf.textGeneration({
        model: this.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        }
      });

      const testCases = this.parseResponse(response.generated_text, userStory, testType);
      this.validateTestCases(testCases);
      
      return testCases;
    } catch (error) {
      console.error('Hugging Face API Error:', error);
      
      // Try fallback models if the primary model fails
      if (this.supportedModels.length > 1 && this.model !== this.supportedModels[0]) {
        console.log(`Trying fallback model: ${this.supportedModels[0]}`);
        this.model = this.supportedModels[0];
        return this.generateTestCases(userStory, testType, complexity, count);
      }
      
      throw new Error(`Failed to generate test cases: ${error.message}`);
    }
  }

  /**
   * Sets the model to use for text generation
   * @param {string} modelName - Name of the HuggingFace model to use
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

module.exports = new HuggingFaceService();
