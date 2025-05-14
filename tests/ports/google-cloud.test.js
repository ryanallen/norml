import { strict as assert } from 'assert';
import { test } from 'node:test';
import { GoogleCloudPort } from '../../ports/interfaces.js';

// Test implementation of the port for validation
class TestGoogleCloudPort extends GoogleCloudPort {
  constructor() {
    super();
    this.initialized = false;
    this.lastApiCall = null;
    this.mockResponses = new Map();
  }

  async initialize(config) {
    if (!config?.projectId) {
      throw new Error('Google Cloud project ID is required');
    }
    this.initialized = true;
    return true;
  }

  async callApi(service, method, params) {
    if (!this.initialized) {
      throw new Error('Port not initialized');
    }
    this.lastApiCall = { service, method, params };
    const key = `${service}:${method}`;
    if (this.mockResponses.has(key)) {
      return this.mockResponses.get(key);
    }
    return { success: true };
  }

  async getAuthToken() {
    if (!this.initialized) {
      throw new Error('Port not initialized');
    }
    return 'test-token';
  }

  async handleError(error) {
    return {
      message: error.message || 'Unknown error',
      code: error.code || 'TEST_ERROR',
      status: error.status || 500
    };
  }

  // Test helper methods
  setMockResponse(service, method, response) {
    this.mockResponses.set(`${service}:${method}`, response);
  }
}

test('GoogleCloudPort Interface', async (t) => {
  let port;

  t.beforeEach(() => {
    port = new TestGoogleCloudPort();
  });

  await t.test('should define required interface methods', () => {
    assert.equal(typeof GoogleCloudPort.prototype.initialize, 'function');
    assert.equal(typeof GoogleCloudPort.prototype.callApi, 'function');
    assert.equal(typeof GoogleCloudPort.prototype.getAuthToken, 'function');
    assert.equal(typeof GoogleCloudPort.prototype.handleError, 'function');
  });

  await t.test('should enforce initialization requirement', async () => {
    try {
      await port.callApi('test', 'method');
      assert.fail('Should require initialization');
    } catch (error) {
      assert.equal(error.message, 'Port not initialized');
    }
  });

  await t.test('should validate initialization config', async () => {
    try {
      await port.initialize({});
      assert.fail('Should require project ID');
    } catch (error) {
      assert.equal(error.message, 'Google Cloud project ID is required');
    }
  });

  await t.test('should allow API calls after initialization', async () => {
    await port.initialize({ projectId: 'test' });
    const result = await port.callApi('test', 'method', { data: 'test' });
    assert.equal(result.success, true);
    assert.deepEqual(port.lastApiCall, {
      service: 'test',
      method: 'method',
      params: { data: 'test' }
    });
  });

  await t.test('should provide auth token after initialization', async () => {
    await port.initialize({ projectId: 'test' });
    const token = await port.getAuthToken();
    assert.equal(token, 'test-token');
  });

  await t.test('should format errors consistently', async () => {
    const error = new Error('Test error');
    error.code = 'TEST';
    error.status = 400;

    const formatted = await port.handleError(error);
    assert.equal(formatted.message, 'Test error');
    assert.equal(formatted.code, 'TEST');
    assert.equal(formatted.status, 400);
  });

  await t.test('should handle custom API responses', async () => {
    await port.initialize({ projectId: 'test' });
    port.setMockResponse('compute', 'listInstances', {
      items: ['instance-1', 'instance-2']
    });

    const result = await port.callApi('compute', 'listInstances');
    assert.deepEqual(result, {
      items: ['instance-1', 'instance-2']
    });
  });
}); 