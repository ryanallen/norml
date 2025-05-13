// Test database status check logic
import test from 'node:test';
import assert from 'node:assert';
import { checkDbStatus } from '../../logic/db-status.js';

test('Database status logic', async (t) => {
  await t.test('returns available when database responds', async () => {
    // Mock adapter that simulates successful database
    const mockAdapter = async () => ({
      db: () => ({
        command: () => Promise.resolve({ ok: 1 })
      }),
      close: () => Promise.resolve()
    });

    const result = await checkDbStatus(mockAdapter);
    
    assert.strictEqual(result.available, true);
    assert.ok(result.checkedAt instanceof Date);
  });

  await t.test('returns unavailable when database fails', async () => {
    // Mock adapter that simulates database failure
    const mockAdapter = async () => {
      throw new Error('Connection failed');
    };

    const result = await checkDbStatus(mockAdapter);
    
    assert.strictEqual(result.available, false);
    assert.strictEqual(result.error, 'Connection failed');
    assert.ok(result.checkedAt instanceof Date);
  });

  await t.test('returns unavailable when database command fails', async () => {
    // Mock adapter that connects but fails on command
    const mockAdapter = async () => ({
      db: () => ({
        command: () => Promise.reject(new Error('Command failed'))
      }),
      close: () => Promise.resolve()
    });

    const result = await checkDbStatus(mockAdapter);
    
    assert.strictEqual(result.available, false);
    assert.strictEqual(result.error, 'Command failed');
    assert.ok(result.checkedAt instanceof Date);
  });

  await t.test('closes connection even after error', async () => {
    let closed = false;
    const mockAdapter = async () => ({
      db: () => ({
        command: () => Promise.reject(new Error('Command failed'))
      }),
      close: () => {
        closed = true;
        return Promise.resolve();
      }
    });

    await checkDbStatus(mockAdapter);
    
    assert.strictEqual(closed, true);
  });
}); 