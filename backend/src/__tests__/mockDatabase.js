const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Setup in-memory MongoDB for testing
 */
async function setupTestDatabase() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  return mongoUri;
}

/**
 * Teardown in-memory MongoDB after tests
 */
async function teardownTestDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}

/**
 * Clear all collections between tests
 */
async function clearDatabase() {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
  clearDatabase
};
