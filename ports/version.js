// Version endpoint
import { getVersion } from '../logic/version.js';
import { VersionAdapter } from '../adapters/version.js';

const versionAdapter = new VersionAdapter();

export async function handleVersionRequest(req, res) {
  if (req.method === 'GET' && req.url === '/api/version') {
    const result = await getVersion(versionAdapter);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return true;
  }
  return false;
} 