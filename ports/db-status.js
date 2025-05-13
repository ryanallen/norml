// This is our database status endpoint
// It checks if MongoDB is working and tells the browser about it

import dbAdapter from '../adapters/db.js';
import { checkDbStatus } from '../logic/db-status.js';
import { formatSuccessResponse, getStatusCode } from '../presenters/db-status.js';

// Handle a request to check database status
export async function handleRequest(req, res) {
  // Only handle GET requests to /db
  if (req.method === 'GET' && req.url === '/db') {
    // Ask the logic layer to check if database is working
    const statusData = await checkDbStatus(dbAdapter);
    // Ask the presenter layer to format the response nicely
    const response = formatSuccessResponse(statusData);
    // Get the right HTTP status code for the situation
    const statusCode = getStatusCode(statusData);
    
    // Send the response back to the browser as JSON
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return true;
  }
  return false;
} 