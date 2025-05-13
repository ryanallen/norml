// Database status check logic

// Try to connect to the database and tell us if it worked
export async function checkDbStatus(dbAdapter) {
  try {
    // Get a connection to the database
    const client = await dbAdapter();
    // Say "ping" to the database - if it answers, it's working
    await client.db('admin').command({ ping: 1 });
    // Always close the connection when we're done
    await client.close();
    // Tell everyone it's working
    return {
      available: true,
      checkedAt: new Date()
    };
  } catch (error) {
    // Something went wrong - tell everyone it's not working
    return {
      available: false,
      checkedAt: new Date(),
      errorType: error.name
    };
  }
} 