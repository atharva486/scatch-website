const mongoose = require('mongoose');

/**
 * Connects to MongoDB.
 *
 * Resolution order:
 *   1. `MONGODB_URI` from the environment (production - MongoDB Atlas)
 *   2. `MONGODB_URI` from server/.env
 *   3. An in-memory MongoDB (development only) so the app always boots
 *      even when no database has been configured yet.
 *
 * Returns `{ uri, inMemory }` so callers know which mode is active.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  mongoose.set('strictQuery', true);

  if (uri) {
    await mongoose.connect(uri, {
      // Fail fast instead of hanging forever when Atlas is unreachable.
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    return { uri, inMemory: false };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'MONGODB_URI is not set. Production requires a real MongoDB connection string. ' +
        'See .env.example for the expected format.'
    );
  }

  // Lazily required so the production bundle never needs the dependency.
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const memoryServer = await MongoMemoryServer.create({
    instance: { dbName: process.env.MONGODB_DBNAME || 'scatch' },
  });
  const memoryUri = memoryServer.getUri();

  await mongoose.connect(memoryUri);

  // Keep a reference so the process is not killed by the GC.
  mongoose.__memoryServer = memoryServer;
  return { uri: memoryUri, inMemory: true };
}

module.exports = { connectDB };