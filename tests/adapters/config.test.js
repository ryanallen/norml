import { strict as assert } from 'assert';
import { test } from 'node:test';
import { ConfigAdapter } from '../../adapters/config.js';
import { writeFileSync, unlinkSync } from 'fs';

test('ConfigAdapter', async (t) => {
  let adapter;

  t.beforeEach(() => {
    // Reset process.env before each test
    process.env = {};
    adapter = new ConfigAdapter();
  });

  await t.test('should implement ConfigPort interface', () => {
    assert(adapter instanceof ConfigAdapter);
    assert.equal(typeof adapter.get, 'function');
    assert.equal(typeof adapter.set, 'function');
  });

  await t.test('should set and get values', () => {
    adapter.set('TEST_KEY', 'test_value');
    assert.equal(adapter.get('TEST_KEY'), 'test_value');
  });

  await t.test('should handle missing values', () => {
    assert.equal(adapter.get('MISSING_KEY'), undefined);
  });

  await t.test('should load values from .env file', () => {
    // Create a test .env file
    writeFileSync('.env', 'TEST_ENV=test_value\n# Comment\nKEY2=value2');
    
    // Create new adapter to trigger load
    const envAdapter = new ConfigAdapter();
    
    assert.equal(envAdapter.get('TEST_ENV'), 'test_value');
    assert.equal(envAdapter.get('KEY2'), 'value2');
    
    // Clean up
    unlinkSync('.env');
  });

  await t.test('should handle malformed .env lines', () => {
    // Create a test .env file with malformed lines
    writeFileSync('.env', 'TEST_ENV=test_value\ninvalid_line\nKEY2=value2');
    
    // Create new adapter to trigger load
    const envAdapter = new ConfigAdapter();
    
    assert.equal(envAdapter.get('TEST_ENV'), 'test_value');
    assert.equal(envAdapter.get('KEY2'), 'value2');
    
    // Clean up
    unlinkSync('.env');
  });

  await t.test('should handle empty .env lines', () => {
    // Create a test .env file with empty lines
    writeFileSync('.env', '\nTEST_ENV=test_value\n\nKEY2=value2\n');
    
    // Create new adapter to trigger load
    const envAdapter = new ConfigAdapter();
    
    assert.equal(envAdapter.get('TEST_ENV'), 'test_value');
    assert.equal(envAdapter.get('KEY2'), 'value2');
    
    // Clean up
    unlinkSync('.env');
  });
}); 