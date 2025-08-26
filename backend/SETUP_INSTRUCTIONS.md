# Environment Setup Instructions

## Quick Setup

Run the automated setup script to configure all environment variables:

```bash
cd backend
npm run setup
```

## Manual Setup

If you prefer to set up manually, edit the `.env` file with the following variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@your-cluster.mongodb.net/test-case-generator

# Authentication
JWT_SECRET=your-secure-jwt-secret-here

# AI Services
OPENAI_API_KEY=your-openai-api-key-here
HUGGINGFACE_API_KEY=your-huggingface-api-key-here

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

## Getting API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key and use it for `OPENAI_API_KEY`

### HuggingFace API Key
1. Go to https://huggingface.co/settings/tokens
2. Sign in to your HuggingFace account
3. Click "New token"
4. Copy the key and use it for `HUGGINGFACE_API_KEY`

### MongoDB URI
1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get the connection string from the "Connect" section
4. Replace username, password, and cluster details

## Running the Application

After setting up environment variables:

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The server will run on http://localhost:5000

## Testing

Run tests to verify everything works:
```bash
npm test
```

## Production Deployment

For production, make sure to:
1. Set `NODE_ENV=production`
2. Use a secure JWT secret (at least 64 characters)
3. Use production MongoDB URI
4. Set proper FRONTEND_URL for your production frontend
5. Never commit .env files to version control
