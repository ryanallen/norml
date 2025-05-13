// Test for MongoDB adapter
import test from 'node:test';
import assert from 'node:assert';
import dbAdapter from '../../adapters/db.js';

// Test adapter direct connection
test('MongoDB adapter connection', async () => {
  const client = await dbAdapter();
  try {
    // Verify connection with ping
    const ping = await client.db('admin').command({ ping: 1 });
    assert.strictEqual(ping.ok, 1, 'Ping should return OK');
  } finally {
    // Clean up
    await client.close();
  }
}); 