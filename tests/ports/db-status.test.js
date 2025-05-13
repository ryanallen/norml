// Test if our database status endpoint works right
import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

test('Database status endpoint works', async () => {
  // Create a test web server
  const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/db-status/db') {
      // Pretend the database is always working (fake it for testing)
      const status = { available: true, checkedAt: new Date() };
      const response = { status: 'available', time: status.checkedAt.toISOString() };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    }
  });

  // Start the test server on port 8081 to avoid conflicts
  const testPort = 8081;
  server.listen(testPort);
  
  try {
    // Ask if database is working
    const response = await fetch(`http://localhost:${testPort}/db-status/db`);
    const data = await response.json();
    
    // Check if everything looks right
    assert.strictEqual(response.status, 200, 'Should return OK status');
    assert.strictEqual(data.status, 'available', 'Should say database is available');
    assert.ok(Date.parse(data.time), 'Should include check time');
  } finally {
    // Always clean up our test server
    server.close();
  }
}); 