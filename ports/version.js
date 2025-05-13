// Version information endpoint
import { getVersion } from '../logic/version.js';
import { formatVersion } from '../presenters/version.js';

export async function handleRequest(req, res) {
  if (req.method === 'GET' && req.url === '/version') {
    const version = getVersion();
    const response = formatVersion(version);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return true;
  }
  return false;
} 