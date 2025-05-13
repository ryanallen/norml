// Test database adapter functionality
import test from 'node:test';
import assert from 'node:assert';
import dbAdapter, { SimpleDbClient } from '../../adapters/db.js';

// Save original env
const originalEnv = process.env;

test('Database adapter', async (t) => {
  // Reset env before each test
  t.beforeEach(() => {
    process.env = { ...originalEnv };
  });

  // Restore env after each test
  t.afterEach(() => {
    process.env = originalEnv;
  });

  await t.test('requires connection string', async () => {
    delete process.env.DB_URI;
    
    try {
      await dbAdapter();
      assert.fail('Should throw error without DB_URI');
    } catch (error) {
      assert.ok(error.message.includes('DB_URI'));
    }
  });

  await t.test('connects successfully', async () => {
    process.env.DB_URI = 'test://localhost:1234';
    
    const client = await dbAdapter();
    const result = await client.db().command({ status: 1 });
    await client.close();
    
    assert.strictEqual(result.ok, 1);
    assert.strictEqual(client.isConnected, false); // Should be closed
  });

  await t.test('handles invalid commands', async () => {
    const client = new SimpleDbClient('test://localhost:1234');
    await client.connect();
    
    try {
      await client.db().command({ invalid: true });
      assert.fail('Should throw error for invalid command');
    } catch (error) {
      assert.ok(error.message.includes('Unknown command'));
    }
  });

  await t.test('requires connection before commands', async () => {
    const client = new SimpleDbClient('test://localhost:1234');
    // Don't connect
    
    try {
      await client.db().command({ status: 1 });
      assert.fail('Should throw error when not connected');
    } catch (error) {
      assert.ok(error.message.includes('Not connected'));
    }
  });

  await t.test('simulates connection delay', async () => {
    const client = new SimpleDbClient('test://localhost:1234');
    const startTime = Date.now();
    
    await client.connect();
    const duration = Date.now() - startTime;
    
    assert.ok(duration >= 100);
    assert.strictEqual(client.isConnected, true);
  });

  await t.test('maintains connection state', async () => {
    const client = new SimpleDbClient('test://localhost:1234');
    assert.strictEqual(client.isConnected, false);
    
    await client.connect();
    assert.strictEqual(client.isConnected, true);
    
    await client.close();
    assert.strictEqual(client.isConnected, false);
  });
}); 