// Version endpoint
import { getVersion, getBuildInfo } from '../../logic/version/version.js';
import { VersionAdapter } from '../../adapters/version/adapter.js';
import { presenter } from '../../presenters/api/version.js';
import { config } from '../../adapters/env/config.js';

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
  } else if (req.method === 'GET' && req.url === '/api/build-info') {
    try {
      const result = await getBuildInfo(config);
      presenter.present(res, result);
      return true;
    } catch (error) {
      presenter.presentError(res, error);
      return true;
    }
  }
  return false;
} 