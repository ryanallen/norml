// Version endpoint
import { getVersion } from '../logic/version.js';
import { VersionAdapter } from '../adapters/version.js';
import { presenter } from '../presenters/version.js';
import { ResponseHeaders } from './headers.js';

const versionAdapter = new VersionAdapter();

export async function handleVersionRequest(req, res) {
  if (req.method === 'GET' && req.url === '/api/version') {
    try {
      const result = await getVersion(versionAdapter);
      
      // Ensure we have proper headers for API responses
      const headers = ResponseHeaders.getHeadersFor('application/json');
      
      res.writeHead(200, headers);
      res.end(JSON.stringify(result));
      return true;
    } catch (error) {
      presenter.presentError(res, error);
      return true;
    }
  }
  return false;
} 