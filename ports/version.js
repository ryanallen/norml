// Version endpoint
import { getVersion } from '../logic/version.js';
import { VersionAdapter } from '../adapters/version.js';
import { presenter } from '../presenters/version.js';

const versionAdapter = new VersionAdapter();

export async function handleVersionRequest(req, res) {
  if (req.method === 'GET' && req.url === '/api/version') {
    try {
      const result = await getVersion(versionAdapter);
      presenter.present(res, result);
      return true;
    } catch (error) {
      presenter.presentError(res, error);
      return true;
    }
  }
  return false;
} 