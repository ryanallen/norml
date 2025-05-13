// Test if we can talk to MongoDB
import test from 'node:test';
import assert from 'node:assert';
import dbAdapter from '../../adapters/db.js';

test('Can connect to MongoDB', async () => {
  // Try to connect
  const client = await dbAdapter();
  try {
    // Say "ping" and make sure it answers
    const ping = await client.db('admin').command({ ping: 1 });
    assert.strictEqual(ping.ok, 1, 'MongoDB should answer our ping');
  } finally {
    // Always clean up our connection
    await client.close();
  }
}); 