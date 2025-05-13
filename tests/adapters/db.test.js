// Test database adapter functionality
import { strict as assert } from 'assert';
import { test } from 'node:test';
import { DatabaseAdapter } from '../../adapters/db.js';

// Save original env
const originalEnv = process.env;

test('DatabaseAdapter', async (t) => {
  let adapter;

  t.beforeEach(() => {
    adapter = new DatabaseAdapter();
  });

  await t.test('should implement DatabasePort interface', () => {
    assert(adapter instanceof DatabaseAdapter);
    assert.equal(typeof adapter.connect, 'function');
    assert.equal(typeof adapter.disconnect, 'function');
    assert.equal(typeof adapter.checkStatus, 'function');
  });

  await t.test('should connect successfully', async () => {
    const result = await adapter.connect();
    assert.equal(result, true);
    assert.equal(adapter.isConnected, true);
    assert.equal(adapter.lastError, null);
  });

  await t.test('should return status', async () => {
    await adapter.connect();
    const status = await adapter.checkStatus();
    assert.equal(status.connected, true);
    assert.equal(status.lastError, null);
    assert(status.timestamp);
  });

  await t.test('should disconnect successfully', async () => {
    await adapter.connect();
    await adapter.disconnect();
    assert.equal(adapter.isConnected, false);
    assert.equal(adapter.lastError, null);
  });

  await t.test('should handle connection errors', async () => {
    // Mock setTimeout to fail
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = (cb) => {
      global.setTimeout = originalSetTimeout;
      throw new Error('Connection timeout');
    };

    try {
      await adapter.connect();
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.equal(error.message, 'Connection timeout');
      assert.equal(adapter.isConnected, false);
      assert.equal(adapter.lastError, error);
    }
  });

  await t.test('should return error status after failed connection', async () => {
    // Mock setTimeout to fail
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = (cb) => {
      global.setTimeout = originalSetTimeout;
      throw new Error('Connection timeout');
    };

    try {
      await adapter.connect();
    } catch (error) {
      const status = await adapter.checkStatus();
      assert.equal(status.connected, false);
      assert.equal(status.lastError.message, 'Connection timeout');
      assert(status.timestamp);
    }
  });

  await t.test('should clear error on successful reconnect', async () => {
    // First fail
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = (cb) => {
      global.setTimeout = originalSetTimeout;
      throw new Error('Connection timeout');
    };

    try {
      await adapter.connect();
    } catch (error) {
      // Now succeed
      await adapter.connect();
      assert.equal(adapter.isConnected, true);
      assert.equal(adapter.lastError, null);
    }
  });
}); 