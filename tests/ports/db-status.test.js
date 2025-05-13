// Test database status endpoint
import test from 'node:test';
import assert from 'node:assert';
import { handleRequest } from '../../ports/db-status.js';

test('Database status endpoint', async (t) => {
  await t.test('returns JSON status response', async () => {
    // Mock successful database check
    const mockDbAdapter = async () => ({
      db: () => ({
        command: async () => ({})
      }),
      close: async () => {}
    });

    const req = {
      method: 'GET',
      url: '/db'
    };

    let responseCode;
    let responseHeaders;
    let responseBody;

    const res = {
      writeHead: (code, headers) => {
        responseCode = code;
        responseHeaders = headers;
      },
      end: (body) => {
        responseBody = body;
      }
    };

    const handled = await handleRequest(req, res, mockDbAdapter);

    assert.strictEqual(handled, true);
    assert.strictEqual(responseCode, 200);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });

    const data = JSON.parse(responseBody);
    assert.strictEqual(data.status, 'available');
    assert.ok(data.time, 'Response should include time');
  });

  await t.test('handles database errors', async () => {
    // Mock failing database check
    const mockDbAdapter = async () => {
      throw new Error('Connection failed');
    };

    const req = {
      method: 'GET',
      url: '/db'
    };

    let responseCode;
    let responseHeaders;
    let responseBody;

    const res = {
      writeHead: (code, headers) => {
        responseCode = code;
        responseHeaders = headers;
      },
      end: (body) => {
        responseBody = body;
      }
    };

    const handled = await handleRequest(req, res, mockDbAdapter);

    assert.strictEqual(handled, true);
    assert.strictEqual(responseCode, 503);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });

    const data = JSON.parse(responseBody);
    assert.strictEqual(data.status, 'unavailable');
    assert.ok(data.error, 'Response should include error');
    assert.ok(data.time, 'Response should include time');
  });

  await t.test('ignores non-GET requests', async () => {
    let called = false;
    const mockDbAdapter = async () => {
      called = true;
      return {
        db: () => ({
          command: async () => ({})
        }),
        close: async () => {}
      };
    };

    const req = {
      method: 'POST',
      url: '/db'
    };

    const res = {
      writeHead: () => {},
      end: () => {}
    };

    const handled = await handleRequest(req, res, mockDbAdapter);
    assert.strictEqual(handled, false);
    assert.strictEqual(called, false);
  });

  await t.test('ignores other paths', async () => {
    let called = false;
    const mockDbAdapter = async () => {
      called = true;
      return {
        db: () => ({
          command: async () => ({})
        }),
        close: async () => {}
      };
    };

    const req = {
      method: 'GET',
      url: '/other'
    };

    const res = {
      writeHead: () => {},
      end: () => {}
    };

    const handled = await handleRequest(req, res, mockDbAdapter);
    assert.strictEqual(handled, false);
    assert.strictEqual(called, false);
  });
}); 