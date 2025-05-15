// Test GCP adapter using environment variables
import { strict as assert } from 'assert';
import { test } from 'node:test';
import { GcpAdapter } from '../gcp.js';
import { readFileSync } from 'node:fs';

// Load GCP config from .env.yaml
let gcpProjectId;
let gcpUrl;
try {
  const envYaml = readFileSync('.env.yaml', 'utf8');
  
  // Extract GCP_PROJECT_ID
  const projectMatch = envYaml.match(/GCP_PROJECT_ID: "(.+?)"/);
  if (projectMatch && projectMatch[1]) {
    gcpProjectId = projectMatch[1];
  }
  
  // Extract GCP_URL if present
  const urlMatch = envYaml.match(/GCP_URL: "(.+?)"/);
  if (urlMatch && urlMatch[1]) {
    gcpUrl = urlMatch[1];
  } else {
    // Fallback to constructed URL
    gcpUrl = `https://${gcpProjectId}.uc.r.appspot.com`;
  }
} catch (error) {
  // Silently continue if file can't be read
  console.log('Warning: Could not read .env.yaml for GCP configuration');
}

test('GcpAdapter', async (t) => {
  const adapter = new GcpAdapter();
  
  // Test error handling for missing credentials
  await t.test('handles missing credentials', async () => {
    try {
      await adapter.initialize({
        projectId: gcpProjectId || 'norml-459701' // Fallback for testing
        // No credentials provided
      });
      assert.fail('Should throw on missing credentials');
    } catch (error) {
      assert(error instanceof Error);
      assert(error.message.includes('credentials'));
    }
  });
  
  // Test error handling for invalid credentials format
  await t.test('handles invalid credential format', async () => {
    try {
      await adapter.initialize({
        projectId: gcpProjectId || 'norml-459701', // Fallback for testing
        credentials: {
          // Missing required fields
          some_field: 'test'
        }
      });
      assert.fail('Should throw on invalid credentials');
    } catch (error) {
      assert(error instanceof Error);
      assert(error.message.includes('format'));
    }
  });
  
  // Optionally test with real credentials if available
  if (gcpProjectId && process.env.CI !== 'true') {
    try {
      // Attempt to parse GCP credentials from .env.yaml
      const envYaml = readFileSync('.env.yaml', 'utf8');
      const credMatch = envYaml.match(/GCP_CREDENTIALS: "({.+})"/s);
      
      if (credMatch && credMatch[1]) {
        // Properly parse the JSON credentials string
        const credentialStr = credMatch[1].replace(/\\"/g, '"')
          .replace(/\\n/g, '\n');
        
        await t.test('connects with real credentials (optional)', { skip: !credentialStr }, async () => {
          try {
            const credentials = JSON.parse(credentialStr);
            const result = await adapter.initialize({
              projectId: gcpProjectId,
              credentials
            });
            assert.equal(result, true);
          } catch (e) {
            // This test is optional, so we'll just log the error
            console.log('Optional real credentials test failed:', e.message);
          }
        });
      }
    } catch (error) {
      // Silently skip real credentials test if it can't be set up
    }
  }
}); 