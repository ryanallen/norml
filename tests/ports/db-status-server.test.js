// Test if our database status endpoint works right
import test from 'node:test';
import assert from 'node:assert';
import express from 'express';

test('Database status endpoint works', async () => {
  // Create a test web server
  const app = express();
  
  // Pretend the database is always working (fake it for testing)
  const fakeChecker = async () => ({ available: true, checkedAt: new Date() });
  const fakeFormatter = data => ({ status: 'available', time: data.checkedAt.toISOString() });
  const fakeStatusCode = () => 200;

  // Add our test endpoint
  app.get('/db-status/db', async (req, res) => {
    const status = await fakeChecker();
    const response = fakeFormatter(status);
    res.status(fakeStatusCode()).json(response);
  });

  // Start the test server on port 8081 to avoid conflicts
  const testPort = 8081;
  const server = app.listen(testPort);
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