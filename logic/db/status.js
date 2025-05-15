// Database status check logic

// Try to connect to the database and tell us if it worked
export async function checkDbStatus(dbAdapter) {
  let client;
  try {
    console.log('[DB Check] Attempting to connect...');
    client = await dbAdapter();
    console.log('[DB Check] Connected, checking status...');
    await client.db().command({ status: 1 });
    console.log('[DB Check] Status check successful');
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

export class DbStatusLogic {
  validateStatus(status) {
    if (!status || typeof status.connected !== 'boolean') {
      throw new Error('Invalid status format');
    }
    return {
      connected: status.connected,
      lastError: status.lastError,
      timestamp: status.timestamp || new Date()
    };
  }
}

export const dbStatusLogic = new DbStatusLogic(); 