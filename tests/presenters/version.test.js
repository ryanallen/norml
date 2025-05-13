// Test version presenter
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatVersion } from '../../presenters/version.js';

test('Version presenter', async (t) => {
  await t.test('formats version correctly', () => {
    const version = '0.1.0-alpha.1';
    const result = formatVersion(version);
    assert.deepStrictEqual(result, { version: '0.1.0-alpha.1' });
  });

  await t.test('handles undefined version', () => {
    assert.throws(() => formatVersion(undefined), {
      message: 'Version is required'
    });
  });
}); 