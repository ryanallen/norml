// Test index page port
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest } from '../../ports/index.js';
import { TestResponse } from '../utils/test-response.js';

test('Index port', async (t) => {
  const checkValidResponse = (res, handled) => {
    assert.strictEqual(handled, true);
    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(res.headers, { 'Content-Type': 'text/html' });
    assert.match(res.body, /<!DOCTYPE html>/);
    assert.match(res.body, /<title>Database Status<\/title>/);
    assert.match(res.body, /Version/);
  };

  await t.test('handles index paths', async () => {
    const paths = ['/', '/index.html'];
    
    for (const url of paths) {
      const res = new TestResponse();
      const handled = await handleRequest({ method: 'GET', url }, res);
      checkValidResponse(res, handled);
    }
  });

  await t.test('ignores other paths', async () => {
    const res = new TestResponse();
    const handled = await handleRequest({ method: 'GET', url: '/other' }, res);
    assert.strictEqual(handled, false);
  });
}); 