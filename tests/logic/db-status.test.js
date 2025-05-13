// Test database status check logic
import { strict as assert } from 'assert';
import { test } from 'node:test';
import { checkDbStatus, dbStatusLogic } from '../../logic/db-status.js';

test('Database status logic', async (t) => {
  await t.test('returns available when database responds', async () => {
    // Mock adapter that simulates successful database
    const mockAdapter = async () => ({
      db: () => ({
        command: async () => ({ ok: 1 })
      }),
      close: async () => {}
    });

    const result = await checkDbStatus(mockAdapter);
    
    assert.equal(result.available, true);
    assert(result.checkedAt instanceof Date);
  });

  await t.test('returns unavailable when database fails', async () => {
    // Mock adapter that simulates database failure
    const mockAdapter = async () => {
      throw new Error('Connection failed');
    };

    const result = await checkDbStatus(mockAdapter);
    
    assert.equal(result.available, false);
    assert.equal(result.error, 'Connection failed');
    assert(result.checkedAt instanceof Date);
  });

  await t.test('returns unavailable when database command fails', async () => {
    // Mock adapter that connects but fails on command
    const mockAdapter = async () => ({
      db: () => ({
        command: async () => {
          throw new Error('Command failed');
        }
      }),
      close: async () => {}
    });

    const result = await checkDbStatus(mockAdapter);
    
    assert.equal(result.available, false);
    assert.equal(result.error, 'Command failed');
    assert(result.checkedAt instanceof Date);
  });

  await t.test('closes connection even after error', async () => {
    let closed = false;
    const mockAdapter = async () => ({
      db: () => ({
        command: async () => {
          throw new Error('Command failed');
        }
      }),
      close: async () => { closed = true; }
    });

    await checkDbStatus(mockAdapter);
    
    assert.equal(closed, true);
  });

  await t.test('validates status format correctly', () => {
    const validStatus = {
      connected: true,
      lastError: null,
      timestamp: new Date()
    };
    const result = dbStatusLogic.validateStatus(validStatus);
    assert.equal(result.connected, true);
    assert.equal(result.lastError, null);
    assert(result.timestamp instanceof Date);
  });

  await t.test('adds timestamp if missing', () => {
    const status = {
      connected: true,
      lastError: null
    };
    const result = dbStatusLogic.validateStatus(status);
    assert(result.timestamp instanceof Date);
  });

  await t.test('throws error for invalid status', () => {
    assert.throws(() => {
      dbStatusLogic.validateStatus({});
    }, /Invalid status format/);
  });
}); 