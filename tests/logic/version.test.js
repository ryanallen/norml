// Test version logic
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getVersion, getBuildInfo } from '../../logic/version.js';

describe('Version logic', () => {
  it('returns version from adapter', async () => {
    const version = await getVersion();
    assert.strictEqual(version, '0.1.0');
  });

  it('returns build info from adapter', async () => {
    const info = await getBuildInfo();
    assert(info.version);
    assert(info.node);
    assert(info.environment);
    assert(info.timestamp);
  });
}); 