// Test if database status check works
import test from 'node:test';
import assert from 'node:assert';
import { checkDbStatus } from '../../logic/db-status.js';

// Check if status works with mock database
test('Database status check returns availability', async () => {
  // Mock MongoDB that always works
  const mockDb = async () => ({
    db: () => ({
      command: () => ({ ok: 1 })
    }),
    close: () => {}
  });

  const result = await checkDbStatus(mockDb);
  assert.strictEqual(result.available, true);
  assert.ok(result.checkedAt instanceof Date);
}); 