// Test version adapter
import { strict as assert } from 'assert';
import { test } from 'node:test';
import { VersionAdapter } from '../../adapters/version.js';

const version = new VersionAdapter();

test('VersionAdapter', async (t) => {
  await t.test('should implement VersionPort interface', () => {
    assert(version.getVersion);
    assert(version.getBuildInfo);
  });

  await t.test('should get version info', async () => {
    const info = await version.getVersion();
    assert.equal(typeof info, 'object');
    assert.equal(info.version, '0.1.0');
    assert.equal(info.name, 'norml');
  });

  await t.test('should get build info', async () => {
    const info = await version.getBuildInfo();
    assert(info.version);
    assert(info.node);
    assert(info.environment);
    assert(info.timestamp);
  });
}); 