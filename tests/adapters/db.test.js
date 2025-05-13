// Test database adapter functionality
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DatabaseAdapter } from '../../adapters/db.js';

// Save original env
const originalEnv = process.env;

describe('DatabaseAdapter', () => {
  it('should implement DatabasePort interface', async () => {
    const db = new DatabaseAdapter();
    assert.strictEqual(typeof db.connect, 'function');
    assert.strictEqual(typeof db.checkStatus, 'function');
    assert.strictEqual(typeof db.disconnect, 'function');
  });

  it('should connect successfully', async () => {
    const db = new DatabaseAdapter();
    await db.connect();
    assert.strictEqual(db.isConnected, true);
    assert.strictEqual(db.lastError, null);
  });

  it('should return status', async () => {
    const db = new DatabaseAdapter();
    await db.connect();
    const status = await db.checkStatus();
    assert.strictEqual(status.connected, true);
    assert.strictEqual(status.lastError, null);
    assert(status.timestamp);
  });

  it('should disconnect successfully', async () => {
    const db = new DatabaseAdapter();
    await db.connect();
    await db.disconnect();
    assert.strictEqual(db.isConnected, false);
    assert.strictEqual(db.lastError, null);
  });
}); 