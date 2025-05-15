// Main request handler
import { presenter } from '../../presenters/main/presenter.js';
import { getPageContent } from '../../logic/main/content.js';

export async function handleMainRequest(req, res) {
  // Handle index page request
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const content = await getPageContent();
    presenter.present(res, content);
    return true;
  }
  return false;
} 