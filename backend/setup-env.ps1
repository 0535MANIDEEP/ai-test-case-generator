# PowerShell script to setup environment variables
$envContent = @"
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@your-cluster.mongodb.net/test-case-generator
JWT_SECRET=<your-secure-jwt-secret>
NODE_ENV=development
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "Environment file created successfully!"
Write-Host "Please add your HUGGINGFACE_API_KEY to the .env file manually"
