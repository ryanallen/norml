// Test if we can talk to MongoDB
import test from 'node:test';
import assert from 'node:assert';
import dbAdapter from '../../adapters/db.js';

test('MongoDB adapter connects', async () => {
  const client = await dbAdapter();
  const ping = await client.db('admin').command({ ping: 1 });
  await client.close();
  assert.strictEqual(ping.ok, 1);
}); 