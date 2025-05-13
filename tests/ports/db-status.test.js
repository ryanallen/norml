// Test database status endpoint
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { handleRequest } from '../../ports/db-status.js';
import { DatabaseAdapter } from '../../adapters/db.js';
import { TestResponse } from '../utils/test-response.js';

describe('Database Status Port', () => {
  let response;
  
  it('should handle successful database check', async () => {
    const adapter = new DatabaseAdapter();
    response = new TestResponse();

    const req = {
      method: 'GET',
      url: '/api/status'
    };

    const handled = await handleRequest(req, response, adapter);

    assert.strictEqual(handled, true);
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.headers, { 'Content-Type': 'application/json' });
    
    const data = response.getBodyJson();
    assert.strictEqual(data.status, 'available');
    assert.ok(data.time);
  });

  it('should handle database connection failure', async () => {
    const adapter = new DatabaseAdapter();
    response = new TestResponse();

    // Force connection failure by mocking setTimeout
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = (cb) => {
      global.setTimeout = originalSetTimeout;
      throw new Error('Connection failed');
    };

    const req = {
      method: 'GET',
      url: '/api/status'
    };

    const handled = await handleRequest(req, response, adapter);

    assert.strictEqual(handled, true);
    assert.strictEqual(response.statusCode, 503);
    assert.deepStrictEqual(response.headers, { 'Content-Type': 'application/json' });
    
    const data = response.getBodyJson();
    assert.strictEqual(data.status, 'error');
    assert.strictEqual(data.message, 'Connection failed');
  });

  it('should ignore non-GET requests', async () => {
    const adapter = new DatabaseAdapter();
    response = new TestResponse();
    
    const req = {
      method: 'POST',
      url: '/api/status'
    };

    const handled = await handleRequest(req, response, adapter);
    assert.strictEqual(handled, false);
  });

  it('should ignore other paths', async () => {
    const adapter = new DatabaseAdapter();
    response = new TestResponse();
    
    const req = {
      method: 'GET',
      url: '/other'
    };

    const handled = await handleRequest(req, response, adapter);
    assert.strictEqual(handled, false);
  });
}); 