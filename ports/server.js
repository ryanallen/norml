// This is our HTTP server port - it handles the network layer
// It takes requests from browsers and sends back responses
// But it doesn't make any decisions about what those responses should be

import http from 'node:http';
import { handleRequest as handleIndex } from './index.js';
import { handleRequest as handleDbStatus } from './db-status.js';
import { handleRequest as handleVersion } from './version.js';

// Log startup environment
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  CF_PAGES: process.env.CF_PAGES,
  CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH,
  CF_PAGES_URL: process.env.CF_PAGES_URL
};
console.log('[Server Port] Starting in environment:', env);

// Create an HTTP server that can accept requests from browsers
const server = http.createServer(async (req, res) => {
  console.log('[Server Port] Request:', req.method, req.url);
  
  // Try each endpoint handler in order
  if (await handleIndex(req, res)) {
    console.log('[Server Port] Handled by index');
    return;
  }

  if (await handleVersion(req, res)) {
    console.log('[Server Port] Handled by version');
    return;
  }
  
  if (await handleDbStatus(req, res)) {
    console.log('[Server Port] Handled by db-status');
    return;
  }

  // If no handler wants this request, send 404
  console.log('[Server Port] No handler found - sending 404');
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Start listening for browser requests
const port = env.PORT;
server.listen(port, () => {
  console.log(`[Server Port] Listening at http://localhost:${port}/`);
}); 