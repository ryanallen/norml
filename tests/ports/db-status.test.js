// Test database status endpoint
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { handleRequest } from '../../ports/db-status.js';
import { MockDatabaseAdapter } from '../mocks/db-adapter.js';

describe('Database Status Port', () => {
  let mockResponse;
  
  it('should handle successful database check', async () => {
    const mockAdapter = new MockDatabaseAdapter({ shouldSucceed: true });
    let responseCode, responseHeaders, responseBody;
    
    mockResponse = {
      writeHead: (code, headers) => {
        responseCode = code;
        responseHeaders = headers;
      },
      end: (body) => {
        responseBody = body;
      }
    };

    const req = {
      method: 'GET',
      url: '/api/status'
    };

    const handled = await handleRequest(req, mockResponse, mockAdapter);

    assert.strictEqual(handled, true);
    assert.strictEqual(mockAdapter.connectCalled, true);
    assert.strictEqual(mockAdapter.checkStatusCalled, true);
    assert.strictEqual(mockAdapter.disconnectCalled, true);
    assert.strictEqual(responseCode, 200);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });
    
    const response = JSON.parse(responseBody);
    assert.strictEqual(response.status, 'available');
    assert.ok(response.time);
  });

  it('should handle database connection failure', async () => {
    const mockAdapter = new MockDatabaseAdapter({ 
      shouldSucceed: false,
      error: new Error('Connection failed')
    });
    
    let responseCode, responseHeaders, responseBody;
    
    mockResponse = {
      writeHead: (code, headers) => {
        responseCode = code;
        responseHeaders = headers;
      },
      end: (body) => {
        responseBody = body;
      }
    };

    const req = {
      method: 'GET',
      url: '/api/status'
    };

    const handled = await handleRequest(req, mockResponse, mockAdapter);

    assert.strictEqual(handled, true);
    assert.strictEqual(mockAdapter.connectCalled, true);
    assert.strictEqual(responseCode, 503);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });
    
    const response = JSON.parse(responseBody);
    assert.strictEqual(response.status, 'error');
    assert.strictEqual(response.message, 'Connection failed');
  });

  it('should ignore non-GET requests', async () => {
    const mockAdapter = new MockDatabaseAdapter();
    
    const req = {
      method: 'POST',
      url: '/api/status'
    };

    const handled = await handleRequest(req, mockResponse, mockAdapter);

    assert.strictEqual(handled, false);
    assert.strictEqual(mockAdapter.connectCalled, false);
    assert.strictEqual(mockAdapter.checkStatusCalled, false);
    assert.strictEqual(mockAdapter.disconnectCalled, false);
  });

  it('should ignore other paths', async () => {
    const mockAdapter = new MockDatabaseAdapter();
    
    const req = {
      method: 'GET',
      url: '/other'
    };

    const handled = await handleRequest(req, mockResponse, mockAdapter);

    assert.strictEqual(handled, false);
    assert.strictEqual(mockAdapter.connectCalled, false);
    assert.strictEqual(mockAdapter.checkStatusCalled, false);
    assert.strictEqual(mockAdapter.disconnectCalled, false);
  });
}); 