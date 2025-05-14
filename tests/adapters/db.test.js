import { strict as assert } from 'assert';
import { test } from 'node:test';
import { DbAdapter } from '../../adapters/db.js';
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
      await adapter.disconnect();
    });
  } else {
    console.log('MONGODB_URI not found in .env.yaml. Tests will be limited.');
  }
  
  // Test connection failures (always works)
  await t.test('handles connection failures', async () => {
    try {
      await adapter.connect({
        uri: "mongodb://wrong-host:27017"
      });
      assert.fail('Should throw on wrong host');
    } catch (error) {
      assert(error instanceof Error);
      const status = await adapter.getStatus();
      assert.equal(status.connected, false);
      assert(status.lastError);
    }
  });
}); 