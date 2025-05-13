// This is our database status endpoint
// It checks if MongoDB is working and tells the browser about it

import { db } from '../adapters/db.js';
import { presenter } from '../presenters/db-status.js';

// Handle a request to check database status
export async function handleRequest(req, res, testAdapter) {
  if (req.method === 'GET' && req.url === '/api/status') {
    try {
      console.log('[DB Port] Using adapter:', testAdapter ? 'test' : 'real');
      const adapter = testAdapter || db;
      await adapter.connect();
      const status = await adapter.checkStatus();
      await adapter.disconnect();
      console.log('[DB Port] Got status:', status);
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