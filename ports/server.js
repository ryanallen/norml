// This is our HTTP server port - it handles the network layer
// It takes requests from browsers and sends back responses
// But it doesn't make any decisions about what those responses should be

import http from 'node:http';
import { handleRequest as handleDbStatus } from './db-status.js';
import { handleRequest as handleServerLogic } from '../logic/server.js';

// Create an HTTP server that can accept requests from browsers
const server = http.createServer(async (req, res) => {
  // First try the database status endpoint
  // This is a special case that handles its own response writing
  if (await handleDbStatus(req, res)) {
    return;
  }

  // For all other URLs, ask the server logic what to do
  // The logic returns an object telling us what response to send
  const response = await handleServerLogic(req);
  
  // Write the response back to the browser
  res.writeHead(response.status, response.headers);
  res.end(response.body);
});

// Start listening for browser requests on port 3000 (or whatever PORT env var says)
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
}); 