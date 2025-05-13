// Test index page logic
import { strict as assert } from 'assert';
import { test } from 'node:test';
import { getPageContent, handleApiResponse, handleStatusResponse, getApiCallHandler } from '../../logic/index.js';

test('Page Content Generator', async (t) => {
  // Test page content structure
  await t.test('should generate correct page content structure', () => {
    const content = getPageContent();
    
    // Test title
    assert.equal(content.title, 'Database Status');
    
    // Test features array
    assert.ok(Array.isArray(content.features));
    assert.equal(content.features.length, 2);
    
    // Test DB status feature
    const dbFeature = content.features[0];
    assert.equal(dbFeature.id, 'db-status');
    assert.equal(dbFeature.name, 'Database Status');
    assert.equal(dbFeature.endpoint, '/api/status');
    assert.deepEqual(dbFeature.states.checking, { type: 'loading', message: 'Checking...' });
    assert.deepEqual(dbFeature.states.success, { type: 'success' });
    assert.deepEqual(dbFeature.states.error, { type: 'error', message: 'Error checking status: {error}' });
    
    // Test version feature
    const versionFeature = content.features[1];
    assert.equal(versionFeature.id, 'version-info');
    assert.equal(versionFeature.name, 'Version');
    assert.equal(versionFeature.endpoint, '/api/version');
    assert.deepEqual(versionFeature.states.checking, { type: 'loading', message: 'Loading...' });
    assert.deepEqual(versionFeature.states.success, { type: 'success' });
    assert.deepEqual(versionFeature.states.error, { type: 'error', message: 'Error loading version' });
  });
});

test('API Response Handler', async (t) => {
  // Test error handling
  await t.test('should handle error responses', () => {
    const error = new Error('Network error');
    const result = handleApiResponse(null, error);
    assert.deepEqual(result, {
      state: 'error',
      error: 'Network error'
    });
  });

  // Test non-OK response
  await t.test('should handle non-OK responses', () => {
    const response = { ok: false, status: 404 };
    const result = handleApiResponse(response, null);
    assert.deepEqual(result, {
      state: 'error',
      error: 'HTTP error! status: 404'
    });
  });

  // Test successful response
  await t.test('should handle successful responses', () => {
    const response = { ok: true, data: { status: 'ok' } };
    const result = handleApiResponse(response, null);
    assert.deepEqual(result, {
      state: 'success',
      data: response
    });
  });
});

test('Status Response Handler', async (t) => {
  // Test available status
  await t.test('should handle available status', () => {
    const data = { status: 'available' };
    const result = handleStatusResponse(data);
    assert.deepEqual(result, {
      state: 'success',
      data: data
    });
  });

  // Test non-available status
  await t.test('should handle non-available status', () => {
    const data = { status: 'unavailable' };
    const result = handleStatusResponse(data);
    assert.deepEqual(result, {
      state: 'error',
      data: data
    });
  });
});

test('API Call Handler', async (t) => {
  // Test handler generation
  await t.test('should generate valid API call handler code', () => {
    const handlerCode = getApiCallHandler();
    
    // Verify code structure
    assert.ok(handlerCode.includes('async function callApi(endpoint)'));
    assert.ok(handlerCode.includes('await fetch(endpoint)'));
    assert.ok(handlerCode.includes('response.json()'));
    assert.ok(handlerCode.includes('success: true'));
    assert.ok(handlerCode.includes('success: false'));
  });

  // Test handler functionality
  await t.test('should generate executable handler code', async () => {
    const handlerCode = getApiCallHandler().trim();
    
    // Create a context with our mock fetch
    const context = {
      fetch: async (endpoint) => {
        if (endpoint === '/success') {
          return {
            ok: true,
            json: async () => ({ data: 'test' })
          };
        }
        throw new Error('Network error');
      }
    };

    // Create and execute the function in our context
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const fn = new AsyncFunction('fetch', `
      ${handlerCode}
      return callApi;
    `).bind(context);
    const callApi = await fn(context.fetch);

    // Test successful call
    const successResult = await callApi('/success');
    assert.deepEqual(successResult, {
      success: true,
      data: { data: 'test' }
    });

    // Test failed call
    const errorResult = await callApi('/error');
    assert.equal(errorResult.success, false);
    assert.equal(errorResult.error, 'Network error');
  });
}); 