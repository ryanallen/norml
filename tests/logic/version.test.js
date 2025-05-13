// Test version logic
import { strict as assert } from 'assert';
import { test } from 'node:test';
import { getVersion } from '../../logic/version.js';

test('Version logic', async (t) => {
  await t.test('returns version from adapter', async () => {
    const mockAdapter = {
      getVersion: async () => ({ version: '0.1.0', name: 'norml' })
    };
    const result = await getVersion(mockAdapter);
    assert.deepEqual(result, {
      status: 'success',
      data: { version: '0.1.0', name: 'norml' }
    });
  });

  await t.test('handles adapter errors', async () => {
    const mockAdapter = {
      getVersion: async () => { throw new Error('Test error'); }
    };
    const result = await getVersion(mockAdapter);
    assert.deepEqual(result, {
      status: 'error',
      error: 'Test error'
    });
  });
}); 