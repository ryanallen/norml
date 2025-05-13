// Test if our presenter formats data correctly
import test from 'node:test';
import assert from 'node:assert';
import { formatSuccessResponse, getStatusCode } from '../../presenters/db-status.js';

// Check if success data is formatted for browser
test('Presenter formats status data', () => {
  const now = new Date();
  const data = {
    available: true,
    checkedAt: now
  };

  const response = formatSuccessResponse(data);
  assert.strictEqual(response.status, 'available');
  assert.strictEqual(response.time, now.toISOString());
});

// Check if we get 200 OK for success
test('Presenter returns success status code', () => {
  const code = getStatusCode();
  assert.strictEqual(code, 200);
}); 