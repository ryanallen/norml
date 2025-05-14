import { strict as assert } from 'assert';
import { test } from 'node:test';
import { GoogleCloudAdapter } from '../../adapters/google-cloud.js';
import { GoogleCloudPort } from '../../ports/interfaces.js';

// Mock credentials for testing
const mockCredentials = {
  projectId: 'test-project',
  credentials: {
    client_email: 'test@project.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9QFi6o...\n-----END PRIVATE KEY-----\n'
  }
};

// Mock OAuth2 token server
function createMockTokenServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: 'mock-token',
          expires_in: 3600
        }));
      });
    });
    
    server.listen(0, () => {
      resolve(server);
    });
  });
}

// Mock HTTP module for adapter tests
class MockHttpAdapter {
  constructor() {
    this.requests = [];
    this.nextResponse = null;
  }

  request(options, callback) {
    this.requests.push(options);
    const res = {
      statusCode: this.nextResponse?.status || 200,
      on: (event, handler) => {
        if (event === 'data') {
          handler(Buffer.from(JSON.stringify(this.nextResponse?.body || {})));
        }
        if (event === 'end') {
          handler();
        }
      }
    };
    process.nextTick(() => callback(res));
    return {
      on: (event, handler) => {},
      write: (data) => {},
      end: () => {}
    };
  }

  setNextResponse(response) {
    this.nextResponse = response;
  }
}

test('GoogleCloudAdapter', async (t) => {
  let adapter;
  let mockServer;
  let mockHttp;

  t.beforeEach(() => {
    mockHttp = new MockHttpAdapter();
    adapter = new GoogleCloudAdapter();
    // Inject mock HTTP
    adapter._request = mockHttp.request.bind(mockHttp);
  });

  t.afterEach(async () => {
    if (mockServer) {
      await new Promise(resolve => mockServer.close(resolve));
    }
  });

  await t.test('should extend GoogleCloudPort', () => {
    assert(adapter instanceof GoogleCloudPort);
  });

  await t.test('should handle token refresh', async () => {
    mockHttp.setNextResponse({
      status: 200,
      body: {
        access_token: 'new-token',
        expires_in: 3600
      }
    });

    await adapter.initialize({
      projectId: 'test',
      credentials: {
        client_email: 'test@test.com',
        private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----'
      }
    });

    const lastRequest = mockHttp.requests[mockHttp.requests.length - 1];
    assert.equal(lastRequest.hostname, 'oauth2.googleapis.com');
    assert.equal(lastRequest.path, '/token');
  });

  await t.test('should format API requests correctly', async () => {
    mockHttp.setNextResponse({
      status: 200,
      body: { success: true }
    });

    await adapter.callApi('compute', 'instances/list', { zone: 'us-central1-a' });

    const lastRequest = mockHttp.requests[mockHttp.requests.length - 1];
    assert.equal(lastRequest.hostname, 'compute.googleapis.com');
    assert.equal(lastRequest.path, '/v1/instances/list');
    assert.equal(lastRequest.method, 'POST');
  });

  await t.test('should handle API errors', async () => {
    mockHttp.setNextResponse({
      status: 403,
      body: {
        error: {
          message: 'Permission denied',
          code: 403
        }
      }
    });

    try {
      await adapter.callApi('compute', 'test');
      assert.fail('Should throw on API error');
    } catch (error) {
      const formatted = await adapter.handleError(error);
      assert.equal(formatted.message, 'Permission denied');
      assert.equal(formatted.status, 403);
    }
  });

  await t.test('should refresh expired tokens automatically', async () => {
    // First initialize
    mockHttp.setNextResponse({
      status: 200,
      body: {
        access_token: 'token-1',
        expires_in: 3600
      }
    });
    await adapter.initialize({
      projectId: 'test',
      credentials: {
        client_email: 'test@test.com',
        private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----'
      }
    });

    // Force token expiry
    adapter.tokenExpiry = Date.now() / 1000 - 1;

    // Set up new token response
    mockHttp.setNextResponse({
      status: 200,
      body: {
        access_token: 'token-2',
        expires_in: 3600
      }
    });

    const token = await adapter.getAuthToken();
    assert.equal(token, 'token-2');
  });

  await t.test('should implement GoogleCloudPort interface', () => {
    assert(adapter instanceof GoogleCloudAdapter);
    assert.equal(typeof adapter.initialize, 'function');
    assert.equal(typeof adapter.callApi, 'function');
    assert.equal(typeof adapter.getAuthToken, 'function');
    assert.equal(typeof adapter.handleError, 'function');
  });

  await t.test('should require project ID for initialization', async () => {
    try {
      await adapter.initialize({ credentials: {} });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.equal(error.message, 'Google Cloud project ID is required');
    }
  });

  await t.test('should require credentials for initialization', async () => {
    try {
      await adapter.initialize({ projectId: 'test' });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.equal(error.message, 'Google Cloud credentials are required');
    }
  });

  await t.test('should initialize with valid credentials', async () => {
    mockServer = await createMockTokenServer();
    const result = await adapter.initialize(mockCredentials);
    assert.equal(result, true);
    assert(adapter.config);
    assert(adapter.authToken);
  });

  await t.test('should refresh expired token', async () => {
    mockServer = await createMockTokenServer();
    await adapter.initialize(mockCredentials);
    const originalToken = adapter.authToken;
    
    // Force token expiry
    adapter.tokenExpiry = Math.floor(Date.now() / 1000) - 1;
    
    await adapter.getAuthToken();
    assert.notEqual(adapter.authToken, originalToken);
  });

  await t.test('should format unknown errors', async () => {
    const formattedError = await adapter.handleError({});
    assert.equal(formattedError.message, 'Unknown Google Cloud API error');
    assert.equal(formattedError.code, 'UNKNOWN');
    assert.equal(formattedError.status, 500);
  });

  await t.test('should require initialization before API calls', async () => {
    try {
      await adapter.callApi('test', 'method');
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.equal(error.message, 'Google Cloud adapter not initialized');
    }
  });

  await t.test('should validate credential format during token refresh', async () => {
    try {
      await adapter.initialize({
        projectId: 'test',
        credentials: {}
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.equal(error.message, 'Invalid credentials format');
    }
  });

  await t.test('should detect token expiry correctly', () => {
    // Test expired token
    adapter.tokenExpiry = Math.floor(Date.now() / 1000) - 1;
    assert(adapter.isTokenExpired());

    // Test valid token
    adapter.tokenExpiry = Math.floor(Date.now() / 1000) + 3600;
    assert(!adapter.isTokenExpired());

    // Test token near expiry (within 5 minutes)
    adapter.tokenExpiry = Math.floor(Date.now() / 1000) + 250;
    assert(adapter.isTokenExpired());
  });
}); 