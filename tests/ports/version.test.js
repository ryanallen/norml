// Test version endpoint
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest } from '../../ports/version.js';

describe('Version Port', () => {
  let mockResponse;

  it('handles GET /api/version successfully', async () => {
    const mockGetVersion = async () => '1.0.0';
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
      url: '/api/version'
    };

    const handled = await handleRequest(req, mockResponse, mockGetVersion);
    
    assert.strictEqual(handled, true);
    assert.strictEqual(responseCode, 200);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });
    
    const data = JSON.parse(responseBody);
    assert.strictEqual(data.status, 'available');
    assert.strictEqual(data.version, '1.0.0');
    assert.ok(data.time);
  });

  it('handles version errors correctly', async () => {
    const mockGetVersion = async () => {
      throw new Error('Version error');
    };

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
      url: '/api/version'
    };

    const handled = await handleRequest(req, mockResponse, mockGetVersion);
    
    assert.strictEqual(handled, true);
    assert.strictEqual(responseCode, 503);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });
    
    const data = JSON.parse(responseBody);
    assert.strictEqual(data.status, 'error');
    assert.strictEqual(data.error, 'Version error');
    assert.ok(data.time);
  });

  it('ignores non-GET requests', async () => {
    const mockGetVersion = async () => '1.0.0';
    
    const req = {
      method: 'POST',
      url: '/api/version'
    };

    const handled = await handleRequest(req, mockResponse, mockGetVersion);
    assert.strictEqual(handled, false);
  });

  it('ignores other paths', async () => {
    const mockGetVersion = async () => '1.0.0';
    
    const req = {
      method: 'GET',
      url: '/other'
    };

    const handled = await handleRequest(req, mockResponse, mockGetVersion);
    assert.strictEqual(handled, false);
  });
}); 