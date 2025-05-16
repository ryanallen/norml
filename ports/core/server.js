// This is our HTTP server port - it handles the network layer
// It takes requests from browsers and sends back responses
// But it doesn't make any decisions about what those responses should be

import http from 'node:http';
import router from './router.js';
import { ResponseHeaders } from './headers.js';
// Import secrets adapter so we can access configuration
import { secrets } from '../../adapters/env/secrets.js';

export class ServerPort {
  constructor(configProvider = null) {
    this.configProvider = configProvider;
    this.server = null;
  }
  
  getConfig(key, defaultValue) {
    if (this.configProvider) {
      return this.configProvider.get(key) || defaultValue;
    }
    return process.env[key] || defaultValue;
  }
  
  // Start the server with dependency injection
  start() {
    // Parse PORT to ensure it's a number
    const portValue = this.getConfig('PORT', 3001);
    // Remove quotes if present and convert to number
    const parsedPort = parseInt(portValue.toString().replace(/["']/g, ''), 10);
    
    // Log startup environment
    const env = {
      NODE_ENV: this.getConfig('NODE_ENV', 'development'),
      PORT: parsedPort
    };
    console.log('[Server Port] Starting in environment:', env);

    // Create an HTTP server that can accept requests from browsers
    this.server = http.createServer(async (req, res) => {
      console.log('[Server Port] Request:', req.method, req.url);
      
      // Extract origin from request - crucial for CORS handling
      const requestOrigin = req.headers.origin || null;
      if (requestOrigin) {
        console.log('[Server Port] Request Origin:', requestOrigin);
      }
      
      // Handle CORS preflight requests
      if (req.method === 'OPTIONS') {
        const headers = ResponseHeaders.getPreflightHeaders(requestOrigin);
        // Ensure X-Content-Type-Options is set
        if (!headers['X-Content-Type-Options']) {
          headers['X-Content-Type-Options'] = 'nosniff';
        }
        res.writeHead(204, headers);
        res.end();
        return;
      }
      
      try {
        // Use the router to handle the request
        const handled = await router.route(req, res, { requestOrigin });
        
        if (!handled) {
          // If no handler wants this request, send 404
          console.log('[Server Port] No handler found - sending 404');
          const headers = ResponseHeaders.getHeadersFor('application/json', null, requestOrigin);
          // Ensure X-Content-Type-Options is set
          if (!headers['X-Content-Type-Options']) {
            headers['X-Content-Type-Options'] = 'nosniff';
          }
          res.writeHead(404, headers);
          res.end(JSON.stringify({ 
            error: 'Not Found',
            message: `No handler found for ${req.method} ${req.url}`
          }));
      }
      } catch (error) {
        // Handle any errors that occur during request processing
        console.error('[Server Port] Error handling request:', error);
        console.error('[Server Port] Error stack:', error.stack);
        const headers = ResponseHeaders.getHeadersFor('application/json', null, requestOrigin);
        // Ensure X-Content-Type-Options is set
        if (!headers['X-Content-Type-Options']) {
          headers['X-Content-Type-Options'] = 'nosniff';
        }
        res.writeHead(500, headers);
        res.end(JSON.stringify({ 
          error: 'Internal Server Error',
          message: error.message
        }));
      }
    });

    // Start listening for browser requests
    const port = env.PORT;
    this.server.listen(port, () => {
      console.log(`[Server Port] Listening at http://localhost:${port}/`);
      console.log('[Server Port] MongoDB URI:', process.env.MONGODB_URI ? 'Configured' : 'Not configured');
    });
    
    return this.server;
  }
  
  // Stop the server
  stop() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
  
  // Set the config provider
  setConfigProvider(configProvider) {
    this.configProvider = configProvider;
    return this;
  }
}

// Create and export a singleton instance
const serverPort = new ServerPort();

// Helper function to start the server (used by app.js)
export function startServer(port = null) {
  // Only set PORT if explicitly provided, otherwise use the environment value
  if (port) {
    process.env.PORT = port;
  }
  
  // Log all environment variables to help debug
  console.log('[Server] Starting with MONGODB_URI:', secrets.has('MONGODB_URI') ? 'Present' : 'Missing');
  
  return serverPort.start();
}

export default serverPort; 