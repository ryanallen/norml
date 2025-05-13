// Test if our database checker works right
import test from 'node:test';
import assert from 'node:assert';
import { checkDbStatus } from '../../logic/health.js';

test('Database checker works', async () => {
  // Pretend to be MongoDB (fake it for testing)
  const fakeMongoDB = async () => ({
    db: () => ({
      command: async () => ({ ok: 1 }),  // Always say the ping worked
      close: async () => {}  // Pretend to close
    }),
    close: async () => {}  // Pretend to close the main connection
  });

  // Check if our checker works with the fake MongoDB
  const result = await checkDbStatus(fakeMongoDB);
  
  // Make sure it says database is working
  assert.strictEqual(result.available, true, 'Should say database is available');
  // Make sure it includes when we checked
  assert.ok(result.checkedAt instanceof Date, 'Should include check time');
}); 