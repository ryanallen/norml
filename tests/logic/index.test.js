// Test index page logic
import { strict as assert } from 'assert';
import { test } from 'node:test';
import { getPageContent, handleApiResponse, handleStatusResponse } from '../../logic/index.js';

test('Page Content Generator', async (t) => {
  await t.test('generates correct page content', () => {
    const content = getPageContent();
    assert.equal(content.title, 'Database Status');
    
    const [dbFeature, versionFeature] = content.features;
    assert.equal(content.features.length, 2);
    
    assert.deepEqual(dbFeature, {
      id: 'db-status',
      name: 'Database Status',
      endpoint: '/api/status',
      states: {
        checking: { type: 'loading', message: 'Checking...' },
        success: { type: 'success' },
        error: { type: 'error', message: 'Error checking status: {error}' }
      }
    });
    
    assert.deepEqual(versionFeature, {
      id: 'version-info',
      name: 'Version',
      endpoint: '/api/version',
      states: {
        checking: { type: 'loading', message: 'Loading...' },
        success: { type: 'success' },
        error: { type: 'error', message: 'Error loading version' }
      }
    });
  });
});

test('Response Handlers', async (t) => {
  await t.test('API response handler', () => {
    const cases = [
      {
        name: 'error response',
        input: { response: null, error: new Error('Network error') },
        expected: { state: 'error', error: 'Network error' }
      },
      {
        name: 'non-OK response',
        input: { response: { ok: false, status: 404 }, error: null },
        expected: { state: 'error', error: 'HTTP error! status: 404' }
      },
      {
        name: 'successful response',
        input: { response: { ok: true, data: { status: 'ok' } }, error: null },
        expected: { state: 'success', data: { ok: true, data: { status: 'ok' } } }
      }
    ];

    for (const { name, input, expected } of cases) {
      const result = handleApiResponse(input.response, input.error);
      assert.deepEqual(result, expected, name);
    }
  });

  await t.test('status response handler', () => {
    const cases = [
      {
        name: 'available status',
        input: { status: 'available' },
        expected: { state: 'success', data: { status: 'available' } }
      },
      {
        name: 'unavailable status',
        input: { status: 'unavailable' },
        expected: { state: 'error', data: { status: 'unavailable' } }
      }
    ];

    for (const { name, input, expected } of cases) {
      const result = handleStatusResponse(input);
      assert.deepEqual(result, expected, name);
    }
  });
}); 