# AI Test Case Generator for QA Teams

A comprehensive full-stack application that uses AI to generate test cases from user stories and feature descriptions. Built with modern technologies and designed for production deployment.

## 🚀 Features

- **AI-Powered Test Generation**: Uses OpenAI GPT models to generate comprehensive test cases
- **Multiple Test Types**: Functional, edge cases, and negative test scenarios
- **Export Functionality**: Export test cases to CSV and Excel formats
- **Dashboard**: View and manage previously generated test cases
- **User Authentication**: Secure user management for teams
- **Responsive Design**: Built with React and TailwindCSS

## 🛠️ Tech Stack

### Frontend
- React.js 18
- TailwindCSS
- Axios for API calls
- React Router for navigation
- React Hook Form for form handling

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- OpenAI API integration
- Multer for file handling

### Testing
- Jest for unit testing
- Playwright for E2E testing
- Supertest for API testing

### Deployment
- AWS EC2 for hosting
- AWS S3 for file storage
- GitHub Actions for CI/CD
- Docker for containerization

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- OpenAI API key
- AWS account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-test-case-generator
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   Create `.env` files in both backend and frontend directories:

   **Backend (.env)**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/test-case-generator
   JWT_SECRET=your-jwt-secret-key
   OPENAI_API_KEY=your-openai-api-key
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_S3_BUCKET=your-s3-bucket-name
   ```

   **Frontend (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

   **Hugging Face API Key Setup**
   - Run the setup script to configure your Hugging Face API key:
   ```bash
   cd backend
   node setup-env.js
   ```

   **Note**: Ensure to replace the placeholders in the `.env` files with your actual keys.

5. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend  
   cd frontend
   npm start
   ```

## 🚀 Deployment

### AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security groups: Open ports 22, 80, 443, 3000, 5000

2. **Setup Instance**
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y nginx
   sudo npm install -g pm2
   ```

3. **Deploy Application**
   ```bash
   git clone <repository-url>
   cd ai-test-case-generator
   npm run build:all
   pm2 start ecosystem.config.js
   ```

4. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📊 API Documentation

### Generate Test Cases
```http
POST /api/test-cases/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "userStory": "As a user, I want to login to the system",
  "testType": "functional",
  "complexity": "medium"
}
```

### Get Test Cases
```http
GET /api/test-cases
Authorization: Bearer <token>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@testcasegenerator.com or create an issue in the repository.
