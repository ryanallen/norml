// Test version logic
import { strict as assert } from 'assert';
import { test } from 'node:test';
import { getVersion, validateVersion, getBuildInfo } from '../../logic/version.js';
import { config } from '../../adapters/config.js';

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

  await t.test('validates version correctly', () => {
    // Valid version
    const validVersion = '1.0.0';
    assert.equal(validateVersion(validVersion), validVersion);

    // Invalid version (null)
    assert.throws(() => validateVersion(null), {
      message: 'Version is required'
    });

    // Invalid version (undefined)
    assert.throws(() => validateVersion(undefined), {
      message: 'Version is required'
    });
  });

  await t.test('returns complete build info', async () => {
    // Save original environment
    const originalEnv = process.env.NODE_ENV;
    const originalGet = config.get;

    try {
      // Mock environment
      process.env.NODE_ENV = 'test';
      config.get = (key) => key === 'NODE_ENV' ? 'test' : null;

      const buildInfo = await getBuildInfo();

      // Verify structure
      assert.ok(buildInfo.version);
      assert.equal(typeof buildInfo.node, 'string');
      assert.ok(buildInfo.timestamp.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/));
      assert.equal(buildInfo.environment, 'test');
    } finally {
      // Restore environment
      process.env.NODE_ENV = originalEnv;
      config.get = originalGet;
    }
  });

  await t.test('uses development as default environment', async () => {
    // Save original environment
    const originalEnv = process.env.NODE_ENV;
    const originalGet = config.get;

    try {
      // Mock environment to return null
      process.env.NODE_ENV = undefined;
      config.get = () => null;

      const buildInfo = await getBuildInfo();
      assert.equal(buildInfo.environment, 'development');
    } finally {
      // Restore environment
      process.env.NODE_ENV = originalEnv;
      config.get = originalGet;
    }
  });
}); 