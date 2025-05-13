import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ConfigAdapter } from '../../adapters/config.js';

describe('ConfigAdapter', () => {
  it('should implement ConfigPort interface', () => {
    const config = new ConfigAdapter();
    assert.strictEqual(typeof config.get, 'function');
    assert.strictEqual(typeof config.set, 'function');
  });

  it('should set and get values', () => {
    const config = new ConfigAdapter();
    config.set('TEST_KEY', 'test_value');
    assert.strictEqual(config.get('TEST_KEY'), 'test_value');
  });

  it('should handle missing values', () => {
    const config = new ConfigAdapter();
    assert.strictEqual(config.get('MISSING_KEY'), undefined);
  });
}); 