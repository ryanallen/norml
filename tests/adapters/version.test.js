// Test version adapter
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { VersionAdapter } from '../../adapters/version.js';

describe('VersionAdapter', () => {
  it('should implement VersionPort interface', async () => {
    const version = new VersionAdapter();
    assert.strictEqual(typeof version.getVersion, 'function');
    assert.strictEqual(typeof version.getBuildInfo, 'function');
  });

  it('should load package.json', async () => {
    const version = new VersionAdapter();
    const pkg = await version.loadPackageJson();
    assert(pkg);
    assert.strictEqual(pkg.name, 'norml');
  });

  it('should get version', async () => {
    const version = new VersionAdapter();
    const ver = await version.getVersion();
    assert.strictEqual(ver, '0.1.0');
  });

  it('should get build info', async () => {
    const version = new VersionAdapter();
    const info = await version.getBuildInfo();
    assert(info.version);
    assert(info.node);
    assert(info.environment);
    assert(info.timestamp);
  });
}); 