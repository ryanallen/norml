// Test version endpoint
import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest } from '../../ports/version.js';

test('Version endpoint', async (t) => {
  // Mock modules
  const mockGetVersion = () => '0.1.0-alpha.1';
  const mockFormatVersion = (version) => JSON.stringify({ version });

  await t.test('handles GET /version', async () => {
    const req = {
      method: 'GET',
      url: '/version'
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
    
    const handled = await handleRequest(req, res, mockGetVersion, mockFormatVersion);
    
    assert.strictEqual(handled, true);
    assert.strictEqual(responseCode, 200);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });
    assert.deepStrictEqual(JSON.parse(responseBody), { version: '0.1.0-alpha.1' });
  });

  await t.test('ignores non-GET requests', async () => {
    const req = {
      method: 'POST',
      url: '/version'
    };
    
    const res = {
      writeHead: () => {},
      end: () => {}
    };
    
    const handled = await handleRequest(req, res, mockGetVersion, mockFormatVersion);
    assert.strictEqual(handled, false);
  });

  await t.test('ignores wrong paths', async () => {
    const req = {
      method: 'GET',
      url: '/other'
    };
    
    const res = {
      writeHead: () => {},
      end: () => {}
    };
    
    const handled = await handleRequest(req, res, mockGetVersion, mockFormatVersion);
    assert.strictEqual(handled, false);
  });

  await t.test('handles errors', async () => {
    // Mock the version logic to throw an error
    const mockGetVersion = () => {
      throw new Error('Version error');
    };

    const req = {
      method: 'GET',
      url: '/version'
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
    
    const handled = await handleRequest(req, res, mockGetVersion, mockFormatVersion);
    
    assert.strictEqual(handled, true);
    assert.strictEqual(responseCode, 500);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });
    
    const response = JSON.parse(responseBody);
    assert.strictEqual(response.error, 'Internal server error');
  });
}); 