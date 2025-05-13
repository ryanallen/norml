// Version endpoint
import { getVersion as defaultGetVersion } from '../logic/version.js';
import { presenter } from '../presenters/version.js';

export async function handleRequest(req, res, getVersion = defaultGetVersion) {
  if (req.method === 'GET' && req.url === '/api/version') {
    try {
      const version = await getVersion();
      presenter.present(res, version);
      return true;
    } catch (error) {
      console.error('[Version Port] Error:', error);
      presenter.presentError(res, error);
      return true;
    }
  }
  return false;
} 