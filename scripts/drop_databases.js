// scripts/drop_databases.js
// Usage: node scripts/drop_databases.js [remote|local|both]

require('dotenv').config();
const mongoose = require('mongoose');

const arg = process.argv[2] || 'both';

async function dropRemote() {
  const uri = process.env.REACT_APP_MONGODB_URI;
  if (!uri) {
    console.error('No REACT_APP_MONGODB_URI in .env');
    return;
  }
  console.log('Connecting to remote:', uri.replace(/:\/\/.*@/, '://***@'));
  try {
    const conn = await mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to remote. Dropping database...');
    await conn.dropDatabase();
    console.log('Remote DB dropped');
    await conn.close();
  } catch (err) {
    console.error('Remote drop error:', err && err.message ? err.message : err);
    throw err;
  }
}

async function dropLocal() {
  const uri = 'mongodb://localhost:27017/helixai';
  console.log('Connecting to local:', uri);
  try {
    const conn = await mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to local. Dropping database...');
    await conn.dropDatabase();
    console.log('Local DB dropped');
    await conn.close();
  } catch (err) {
    console.error('Local drop error:', err && err.message ? err.message : err);
    throw err;
  }
}

(async () => {
  try {
    if (arg === 'remote' || arg === 'both') {
      await dropRemote();
    }
    if (arg === 'local' || arg === 'both') {
      await dropLocal();
    }
    console.log('Done');
    process.exit(0);
  } catch (e) {
    console.error('Error during drop:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
