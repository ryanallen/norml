// Index page port
import { presenter } from '../presenters/index.js';
import { getPageContent } from '../logic/index.js';
import { getVersion } from '../logic/version.js';

export async function handleRequest(req, res) {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const content = await getPageContent();
    presenter.present(res, content);
    return true;
  }
  return false;
} 