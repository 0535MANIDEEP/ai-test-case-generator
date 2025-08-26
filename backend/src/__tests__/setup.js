const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { setupTestDatabase, teardownTestDatabase, clearDatabase } = require('./mockDatabase');

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

beforeAll(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});
