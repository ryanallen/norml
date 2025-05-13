// Database status check logic

// Try to connect to the database and tell us if it worked
export async function checkDbStatus(dbAdapter) {
  let client;
  try {
    client = await dbAdapter();
    await client.db('admin').command({ ping: 1 });
    return {
      available: true,
      checkedAt: new Date()
    };
  } catch (error) {
    return {
      available: false,
      checkedAt: new Date(),
      error: 'Database connection failed'
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
} 