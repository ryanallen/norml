// This is our HTTP server port - it handles the network layer
// It takes requests from browsers and sends back responses
// But it doesn't make any decisions about what those responses should be

import http from 'node:http';
import router from './router.js';
import { config } from '../adapters/config.js';
import { ResponseHeaders } from './headers.js';

// Log startup environment
const env = {
  NODE_ENV: config.get('NODE_ENV') || 'development',
  PORT: config.get('PORT') || 3001,
  CF_PAGES: config.get('CF_PAGES'),
  CF_PAGES_BRANCH: config.get('CF_PAGES_BRANCH'),
  CF_PAGES_URL: config.get('CF_PAGES_URL')
};
console.log('[Server Port] Starting in environment:', env);

// Create an HTTP server that can accept requests from browsers
const server = http.createServer(async (req, res) => {
  console.log('[Server Port] Request:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, ResponseHeaders.getHeadersFor('text/plain'));
    res.end();
    return;
  }
  
  try {
    // Use the router to handle the request
    const handled = await router.route(req, res);
    
    if (!handled) {
      // If no handler wants this request, send 404
      console.log('[Server Port] No handler found - sending 404');
      res.writeHead(404, ResponseHeaders.getHeadersFor('application/json'));
      res.end(JSON.stringify({ 
        error: 'Not Found',
        message: `No handler found for ${req.method} ${req.url}`
      }));
  }
  } catch (error) {
    // Handle any errors that occur during request processing
    console.error('[Server Port] Error handling request:', error);
    console.error('[Server Port] Error stack:', error.stack);
    res.writeHead(500, ResponseHeaders.getHeadersFor('application/json'));
    res.end(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error.message
    }));
  }
});

// Start listening for browser requests
const port = env.PORT;
server.listen(port, () => {
  console.log(`[Server Port] Listening at http://localhost:${port}/`);
  console.log('[Server Port] MongoDB URI:', process.env.MONGODB_URI ? 'Configured' : 'Not configured');
}); 