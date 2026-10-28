/**
 * ============================================================================
 * DATABASE CONFIGURATION & CONNECTION (db.js)
 * ============================================================================
 * Connects to MongoDB using Mongoose.
 * Automatically verifies connectivity and seeds starter pets if the database
 * is freshly created.
 * ============================================================================
 */

const mongoose = require('mongoose');
require('dotenv').config();
const { seedPetsIfEmpty } = require('./seed');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pet_adoption_db';

/**
 * Connect to MongoDB and run auto-seeding if needed.
 */
async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000 // Quick failure if MongoDB is not running
    });

    console.log(`✅ Connected to MongoDB successfully!`);
    console.log(`   Host: ${conn.connection.host} | Database: ${conn.connection.name}`);

    // Automatically seed pets if the database is empty
    await seedPetsIfEmpty();

    return { connected: true, host: conn.connection.host, database: conn.connection.name };
  } catch (err) {
    console.error('⚠️  MongoDB Connection Notice:');
    console.error(`   Unable to connect to MongoDB at: ${MONGODB_URI}`);
    console.error(`   Reason: ${err.message}`);
    console.error('   👉 Tip: Make sure your MongoDB service is running on 127.0.0.1:27017.');
    return { connected: false, error: err.message };
  }
}

/**
 * Returns current connection state for /api/health endpoint.
 */
function getConnectionStatus() {
  const stateCode = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const isConnected = stateCode === 1;

  return {
    connected: isConnected,
    engine: 'MongoDB',
    state: isConnected ? 'connected' : 'disconnected',
    host: isConnected ? mongoose.connection.host : null,
    database: isConnected ? mongoose.connection.name : null
  };
}

module.exports = {
  connectDB,
  getConnectionStatus
};
