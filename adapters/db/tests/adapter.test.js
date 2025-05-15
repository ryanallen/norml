import { strict as assert } from 'assert';
import { test } from 'node:test';
import { DbAdapter } from '../adapter.js';
import { readFileSync } from 'node:fs';

// Load MongoDB URI directly from .env.yaml
let mongoUri;
try {
  const envYaml = readFileSync('.env.yaml', 'utf8');
  const match = envYaml.match(/MONGODB_URI: "(.+?)"/);
  if (match && match[1]) {
    // Fix double slash if present
    mongoUri = match[1].replace('//database', '/database');
  }
} catch (error) {
  // Silently continue if file can't be read
}

// Test DB adapter with real MongoDB connection
test('DbAdapter with real MongoDB', async (t) => {
  const adapter = new DbAdapter();
  
  // Test real connection with the URI from .env.yaml
  if (mongoUri) {
    await t.test('connects to real MongoDB', async () => {
      const result = await adapter.connect({ uri: mongoUri });
      assert.equal(result, true);
      assert.equal(adapter.isConnected, true);
      await adapter.disconnect();
    });
    
    await t.test('reports connection status', async () => {
      await adapter.connect({ uri: mongoUri });
      const status = await adapter.getStatus();
      assert.equal(status.connected, true);
      assert.equal(status.lastError, null);
      assert(status.timestamp);
      assert(status.connectionDetails, 'Should include connection details');
      assert(status.connectionDetails.host, 'Should include host in connection details');
      assert(status.connectionDetails.port, 'Should include port in connection details');
      await adapter.disconnect();
    });
  } else {
    console.log('MONGODB_URI not found in .env.yaml. Tests will be limited.');
  }
  
  // Test connection failures
  await t.test('handles connection failures', async () => {
    const result = await adapter.connect({
      uri: "mongodb://wrong-host:27017"
    });
    
    // Should return false instead of throwing
    assert.equal(result, false);
    assert.equal(adapter.isConnected, false);
    assert(adapter.lastError, 'Should have lastError set');
    
    const status = await adapter.getStatus();
    assert.equal(status.connected, false);
    assert(status.lastError, 'Status should include error message');
    assert(status.connectionDetails, 'Should include connection details even on failure');
  });
  
  // Test missing URI
  await t.test('handles missing URI', async () => {
    const result = await adapter.connect({
      uri: null
    });
    
    assert.equal(result, false);
    assert.equal(adapter.isConnected, false);
    assert(adapter.lastError, 'Should have lastError set');
    assert.equal(adapter.lastError.message, 'MongoDB URI is required');
  });
}); 