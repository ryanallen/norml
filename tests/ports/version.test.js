// Test version endpoint
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { handleVersionRequest } from '../../ports/version.js';

test('Version Port', async (t) => {
  await t.test('handles version request', async () => {
    const req = { method: 'GET', url: '/api/version' };
    const res = {
      writeHead: (status, headers) => {
        assert.equal(status, 200);
        assert.deepEqual(headers, { 'Content-Type': 'application/json' });
      },
      end: (data) => {
        const result = JSON.parse(data);
        assert.equal(result.status, 'success');
        assert(result.data.version);
        assert(result.data.name);
      }
    };
    const handled = await handleVersionRequest(req, res);
    assert.equal(handled, true);
  });

  await t.test('ignores other paths', async () => {
    const req = { method: 'GET', url: '/other' };
    const res = {};
    const handled = await handleVersionRequest(req, res);
    assert.equal(handled, false);
  });

  await t.test('ignores non-GET methods', async () => {
    const req = { method: 'POST', url: '/api/version' };
    const res = {};
    const handled = await handleVersionRequest(req, res);
    assert.equal(handled, false);
  });
}); 