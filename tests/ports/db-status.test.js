// Test if our database status endpoint works
import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { handleRequest } from '../../ports/db-status.js';

// Check if /db endpoint returns proper JSON
test('Database status endpoint returns JSON', async () => {
  // Create test server
  const server = http.createServer(async (req, res) => {
    await handleRequest(req, res);
  });

  // Run test on port 8081
  server.listen(8081);
  try {
    const response = await fetch('http://localhost:8081/db');
    const data = await response.json();
    
    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.status, 'available');
    assert.ok(Date.parse(data.time));
  } finally {
    server.close();
  }
}); 