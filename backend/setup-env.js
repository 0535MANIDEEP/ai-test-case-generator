const fs = require('fs');
const path = require('path');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Hugging Face API Setup Script');
console.log('================================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📁 Existing .env file found');
} else {
  console.log('📁 No .env file found, creating a new one');
}

// Extract current API key if exists
let currentApiKey = '';
const apiKeyMatch = envContent.match(/HUGGINGFACE_API_KEY=(.*)/);
if (apiKeyMatch) {
  currentApiKey = apiKeyMatch[1].trim();
  console.log(`🔑 Current API Key: ${currentApiKey.substring(0, 4)}...${currentApiKey.substring(currentApiKey.length - 4)}`);
} else {
  console.log('❌ No HUGGINGFACE_API_KEY found in .env file');
}

console.log('\nPlease enter your Hugging Face API key:');
readline.question('API Key: ', (apiKey) => {
  // Update or add the API key
  if (apiKeyMatch) {
    // Replace existing key
    envContent = envContent.replace(/HUGGINGFACE_API_KEY=.*/, `HUGGINGFACE_API_KEY=${apiKey}`);
  } else {
    // Add new key
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += `HUGGINGFACE_API_KEY=${apiKey}\n`;
  }

  // Write the updated content
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated successfully!');

  // Test if the key can be read
  require('dotenv').config();
  if (process.env.HUGGINGFACE_API_KEY === apiKey) {
    console.log('✅ Environment variable loaded correctly');
  } else {
    console.log('❌ Environment variable not loaded correctly');
  }

  readline.close();
});
