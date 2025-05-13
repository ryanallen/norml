// Index page port
import { presenter } from '../presenters/index.js';
import { getPageContent } from '../logic/index.js';
import { handleVersionRequest } from './version.js';

export async function handleRequest(req, res) {
  // Try to handle version request first
  const handled = await handleVersionRequest(req, res);
  if (handled) return true;

  // Handle index page request
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const content = await getPageContent();
    presenter.present(res, content);
    return true;
  }
  return false;
} 