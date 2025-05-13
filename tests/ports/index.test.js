// Test index page port
import test from 'node:test';
import assert from 'node:assert';
import { handleRequest } from '../../ports/index.js';

test('Index port handles root path', async () => {
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
  
  const handled = await handleRequest(req, res);
  
  assert.strictEqual(handled, true);
  assert.strictEqual(responseCode, 200);
  assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'text/html' });
  assert.ok(responseBody.includes('<!DOCTYPE html>'));
});

test('Index port handles index.html path', async () => {
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
  
  const handled = await handleRequest(req, res);
  
  assert.strictEqual(handled, true);
  assert.strictEqual(responseCode, 200);
  assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'text/html' });
  assert.ok(responseBody.includes('<!DOCTYPE html>'));
});

test('Index port ignores other paths', async () => {
  const req = {
    method: 'GET',
    url: '/other'
  };
  
  const res = {
    writeHead: () => {},
    end: () => {}
  };
  
  const handled = await handleRequest(req, res);
  assert.strictEqual(handled, false);
}); 