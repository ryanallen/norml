// This is our database status endpoint
// It checks if MongoDB is working and tells the browser about it

import dbAdapter from '../adapters/db.js';
import { checkDbStatus } from '../logic/db-status.js';
import { formatSuccessResponse, getStatusCode } from '../presenters/db-status.js';

// Handle a request to check database status
export async function handleRequest(req, res) {
  // Only handle GET requests to /db
  if (req.method === 'GET' && req.url === '/db') {
    console.log(`[${new Date().toISOString()}] Received DB status check request`);
    try {
      const statusData = await checkDbStatus(dbAdapter);
      const response = formatSuccessResponse(statusData);
      const statusCode = getStatusCode(statusData);
      
      console.log(`[${new Date().toISOString()}] Sending response with status ${statusCode}`);
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      return true;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Port handler error:`, error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'error',
        error: 'Internal server error'
      }));
      return true;
    }
  }
  return false;
} 