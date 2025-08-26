# PowerShell script to setup environment variables
$envContent = @"
PORT=5000
MONGODB_URI=mongodb+srv://manideepdaram:HELLO!nani10@test-case-generator.oqzzpdc.mongodb.net/test-case-generator?retryWrites=true&w=majority&appName=test-case-generator
JWT_SECRET=super-secret-jwt-key-for-test-case-generator-app
NODE_ENV=development
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "Environment file created successfully!"
Write-Host "Please add your HUGGINGFACE_API_KEY to the .env file manually"
