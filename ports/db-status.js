// This is our database status endpoint
// It checks if MongoDB is working and tells the browser about it

import { db } from '../adapters/db.js';
import { mongodb } from '../adapters/mongodb.js';
import { presenter } from '../presenters/db-status.js';

// Handle a request to check database status
export async function handleRequest(req, res, testAdapter) {
  if (req.method === 'GET' && req.url === '/api/status') {
    try {
      console.log('[DB Port] Using adapter:', testAdapter ? 'test' : 'mongodb');
      const adapter = testAdapter || mongodb;
      
      // Get basic connection status
      await adapter.connect();
      const status = await adapter.getStatus();

      // Add ping information
      const ping = await adapter.ping();
      status.ping = ping;

      // Add server stats if connection is successful
      if (status.connected) {
        const serverStats = await adapter.getStats();
        if (serverStats.success) {
          status.stats = serverStats.stats;
        }
      }

      // Disconnect after gathering all info
      await adapter.disconnect();

      console.log('[DB Port] Got comprehensive status:', status);
      presenter.present(res, status);
      return true;
    } catch (error) {
      console.log('[DB Port] Got error:', error);
      presenter.presentError(res, error);
      return true;
    }
  }
  return false;
} 