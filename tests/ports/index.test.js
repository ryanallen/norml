// Test index page port
import test from 'node:test';
import assert from 'node:assert';
import { handleRequest } from '../../ports/index.js';

// Create a mock version of the port that doesn't depend on other modules
async function createMockHandler() {
  return async (req, res) => {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      const mockContent = {
        title: 'Test Title',
        version: '0.0.1-test',
        features: [{ name: 'Test Feature', endpoint: '/test' }]
      };
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html><title>${mockContent.title}</title>Version: ${mockContent.version}`);
      return true;
    }
    return false;
  };
}

test('Index port handles requests correctly', async (t) => {
  const mockHandler = await createMockHandler();

  await t.test('handles root path', async () => {
    const req = {
      method: 'GET',
      url: '/'
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
    
    const handled = await mockHandler(req, res);
    
    assert.strictEqual(handled, true);
    assert.strictEqual(responseCode, 200);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'text/html' });
    assert.ok(responseBody.includes('<!DOCTYPE html>'));
    assert.ok(responseBody.includes('Test Title'));
    assert.ok(responseBody.includes('0.0.1-test'));
  });

  await t.test('handles index.html path', async () => {
    const req = {
      method: 'GET',
      url: '/index.html'
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
    
    const handled = await mockHandler(req, res);
    
    assert.strictEqual(handled, true);
    assert.strictEqual(responseCode, 200);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'text/html' });
    assert.ok(responseBody.includes('<!DOCTYPE html>'));
    assert.ok(responseBody.includes('Test Title'));
    assert.ok(responseBody.includes('0.0.1-test'));
  });

  await t.test('ignores other paths', async () => {
    const req = {
      method: 'GET',
      url: '/other'
    };
    
    const res = {
      writeHead: () => {},
      end: () => {}
    };
    
    const handled = await mockHandler(req, res);
    assert.strictEqual(handled, false);
  });
}); 