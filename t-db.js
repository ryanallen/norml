// Test MongoDB connection
import test from 'node:test';
import assert from 'node:assert';
import connectDB from './db.js';

test('MongoDB connection', async () => {
  console.log('Connecting to MongoDB...');
  
  // Connect to MongoDB
  const client = await connectDB();
  
  try {
    // Test connection with ping
    const ping = await client.db('admin').command({ ping: 1 });
    assert.strictEqual(ping.ok, 1, 'MongoDB connection failed');
    
    // Log success info
    console.log('Connected to MongoDB ✓');
    console.log(`Server: ${client.options.hosts[0]}`);
  } finally {
    // Always close connection
    await client.close();
    console.log('Connection closed ✓');
  }
}); 