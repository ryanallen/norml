// This is our HTTP server port - it handles the network layer
// It takes requests from browsers and sends back responses
// But it doesn't make any decisions about what those responses should be

import http from 'node:http';
import { handleRequest as handleDbStatus } from './db-status.js';
import { handleRequest as handleVersion } from './version.js';
import { handleRequest as handleServerLogic } from '../logic/server.js';

// Create an HTTP server that can accept requests from browsers
const server = http.createServer(async (req, res) => {
  // Try each endpoint handler in order
  if (await handleVersion(req, res)) {
    return;
  }
  
  if (await handleDbStatus(req, res)) {
    return;
  }

  // For all other URLs, ask the server logic what to do
  const response = await handleServerLogic(req);
  
  // Write the response back to the browser
  res.writeHead(response.status, response.headers);
  res.end(response.body);
});

// Start listening for browser requests on port 3001 (or whatever PORT env var says)
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
}); 