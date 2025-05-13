// Test for database status business logic
import test from 'node:test';
import assert from 'node:assert';
import dbAdapter from '../../adapters/db.js';
import { checkDbStatus } from '../../logic/db-status.js';

// Test database connection through business logic
test('DB status logic with live connection', async () => {
  // Use the same business logic as the API
  const result = await checkDbStatus(dbAdapter);
  
  // Assert connection was successful
  assert.strictEqual(result.available, true, 'Database should be available');
  assert.ok(result.checkedAt instanceof Date, 'Should include timestamp');
}); 