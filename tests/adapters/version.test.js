// Test version adapter
import { strict as assert } from 'assert';
import { test } from 'node:test';
import { VersionAdapter } from '../../adapters/version.js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

test('VersionAdapter', async (t) => {
  let adapter;
  let originalPackageJson;
  const testPackageJson = {
    name: 'test-app',
    version: '1.0.0'
  };

  t.beforeEach(() => {
    adapter = new VersionAdapter();
    // Save original package.json if it exists
    if (existsSync('package.json')) {
      originalPackageJson = readFileSync('package.json', 'utf8');
    }
    // Write test package.json
    writeFileSync('package.json', JSON.stringify(testPackageJson));
  });

  t.afterEach(() => {
    // Restore original package.json if it existed
    if (originalPackageJson) {
      writeFileSync('package.json', originalPackageJson);
    }
  });

  await t.test('should implement VersionPort interface', () => {
    assert(adapter instanceof VersionAdapter);
    assert.equal(typeof adapter.getVersion, 'function');
    assert.equal(typeof adapter.getBuildInfo, 'function');
  });

  await t.test('should get version info', async () => {
    const info = await adapter.getVersion();
    assert.equal(info.name, 'test-app');
    assert.equal(info.version, '1.0.0');
  });

  await t.test('should get build info', async () => {
    const info = await adapter.getBuildInfo();
    assert.equal(info.version, '1.0.0');
    assert.equal(info.node, process.version);
    assert.equal(info.environment, 'development');
    assert(info.timestamp);
  });

  await t.test('should handle invalid package.json', async () => {
    // Write invalid JSON
    writeFileSync('package.json', 'invalid json');

    try {
      await adapter.getVersion();
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert(error.message.includes('Failed to read version'));
    }
  });

  await t.test('should handle missing version in package.json', async () => {
    // Write package.json without version
    writeFileSync('package.json', JSON.stringify({ name: 'test-app' }));

    const info = await adapter.getVersion();
    assert.equal(info.name, 'test-app');
    assert.equal(info.version, undefined);
  });

  await t.test('should use custom environment from config', async () => {
    process.env.NODE_ENV = 'production';
    const info = await adapter.getBuildInfo();
    assert.equal(info.environment, 'production');
    delete process.env.NODE_ENV;
  });
}); 