// Database status check logic

// Try to connect to the database and tell us if it worked
export async function checkDbStatus(dbAdapter) {
  let client;
  try {
    console.log('[DB Check] Attempting to connect...');
    client = await dbAdapter();
    console.log('[DB Check] Connected, running ping command...');
    await client.db('admin').command({ ping: 1 });
    console.log('[DB Check] Ping successful');
    return {
      available: true,
      checkedAt: new Date()
    };
  } catch (error) {
    console.error('[DB Check] Error:', error.message);
    return {
      available: false,
      checkedAt: new Date(),
      error: error.message
    };
  } finally {
    if (client) {
      console.log('[DB Check] Closing connection');
      await client.close();
    }
  }
} 