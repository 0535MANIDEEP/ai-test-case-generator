const fs = require('fs');
const path = require('path');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const crypto = require('crypto');

console.log('🚀 AI Test Case Generator - Environment Setup');
console.log('=============================================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📁 Existing .env file found');
} else {
  console.log('📁 No .env file found, creating a new one');
}

// Function to get user input
function askQuestion(question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    readline.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Function to update or add environment variable
function updateEnvVariable(key, value) {
  const regex = new RegExp(`^${key}=.*`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += `${key}=${value}\n`;
  }
}

async function setupEnvironment() {
  try {
    console.log('\n🔧 Configuring Environment Variables\n');

    // Server Configuration
    const port = await askQuestion('Server PORT', '5000');
    const nodeEnv = await askQuestion('Node Environment (development/production)', 'development');
    
    // Database
    const mongodbUri = await askQuestion('MongoDB URI', 'mongodb://localhost:27017/test-case-generator');
    
    // Authentication - Generate secure JWT secret
    console.log('\n🔐 Generating secure JWT secret...');
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    console.log('✅ JWT Secret generated successfully');
    
    // AI Services
    console.log('\n🤖 AI Service Configuration');
    console.log('Note: You can get these API keys from:');
    console.log('- OpenAI: https://platform.openai.com/api-keys');
    console.log('- HuggingFace: https://huggingface.co/settings/tokens');
    console.log('IMPORTANT: Enter only the API key value, not the variable name');
    
    const openaiApiKey = await askQuestion('OpenAI API Key (enter only the key value)', '');
    const huggingfaceApiKey = await askQuestion('HuggingFace API Key (enter only the key value)', '');
    
    // Frontend Configuration
    const frontendUrl = await askQuestion('Frontend URL', 'http://localhost:3000');

    // Update environment variables
    updateEnvVariable('PORT', port);
    updateEnvVariable('NODE_ENV', nodeEnv);
    updateEnvVariable('MONGODB_URI', mongodbUri);
    updateEnvVariable('JWT_SECRET', jwtSecret);
    updateEnvVariable('OPENAI_API_KEY', openaiApiKey);
    updateEnvVariable('HUGGINGFACE_API_KEY', huggingfaceApiKey);
    updateEnvVariable('FRONTEND_URL', frontendUrl);

    // Write the updated content
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file updated successfully!');

    // Test if environment variables can be loaded
    require('dotenv').config({ path: envPath });
    console.log('\n🧪 Testing environment variables:');
    console.log(`PORT: ${process.env.PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Missing'}`);
    console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing'}`);
    console.log(`HUGGINGFACE_API_KEY: ${process.env.HUGGINGFACE_API_KEY ? '✓ Set' : '✗ Missing'}`);
    console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || '✗ Missing'}`);

    console.log('\n🎉 Environment setup completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Start the server: npm run dev');
    console.log('3. Make sure MongoDB is running');
    console.log('4. Test the API endpoints');

  } catch (error) {
    console.error('❌ Error during setup:', error);
  } finally {
    readline.close();
  }
}

// Start the setup process
setupEnvironment();
