// Version endpoint
import { getVersion as defaultGetVersion } from '../logic/version.js';

export async function handleRequest(req, res, getVersion = defaultGetVersion) {
  if (req.method === 'GET' && req.url === '/version') {
    try {
      const version = getVersion();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ version }));
      return true;
    } catch (error) {
      console.error('[Version Port] Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
      return true;
    }
  }
  return false;
} 