// Debug script to check environment variables
console.log('Checking environment variables...');
console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');

// Test if we can access other environment variables
console.log('\nAll environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('HUGGINGFACE') || key.includes('API') || key.includes('KEY')) {
    console.log(`${key}: ${process.env[key]}`);
  }
});

// Test if dotenv is working
try {
  require('dotenv').config();
  console.log('\nDotenv loaded successfully');
  console.log('HUGGINGFACE_API_KEY after dotenv:', process.env.HUGGINGFACE_API_KEY ? 'SET' : 'NOT SET');
} catch (error) {
  console.log('Dotenv error:', error.message);
}
