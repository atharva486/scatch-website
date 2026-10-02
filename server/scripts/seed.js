/**
 * CLI wrapper around the demo data seeder.
 *
 * Usage: npm run seed
 *
 * With no MONGODB_URI configured this seeds the in-memory database and exits,
 * which is not very useful - in that mode the running server seeds itself on
 * startup instead.
 */
require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('../config/mongoose-connection');
const { seed } = require('./seedData');

async function run() {
  const { inMemory, uri } = await connectDB();

  if (inMemory) {
    console.warn(
      '\n⚠  No MONGODB_URI is set, so there is nothing persistent to seed.\n' +
        '   Data created here is discarded on exit.\n\n' +
        '   Just run `npm start` instead: with no MONGODB_URI the server starts an\n' +
        '   in-memory database and seeds itself automatically.\n' +
        '   For real data, set MONGODB_URI (see .env.example) and run this again.\n'
    );
    if (mongoose.__memoryServer) await mongoose.__memoryServer.stop();
    await mongoose.connection.close();
    process.exit(0);
  }

  console.log(`Seeding ${uri}`);
  const result = await seed();
  console.log(
    `\n✅ Seeded ${result.sellers} sellers, ${result.users} customers, ` +
      `${result.products} products, ${result.orders} orders\n${result.banner}`
  );
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});