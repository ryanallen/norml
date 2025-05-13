// Index page port
import { formatIndexPage } from '../presenters/index.js';
import { getPageContent } from '../logic/index.js';

export async function handleRequest(req, res) {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const content = getPageContent();
    const html = formatIndexPage(content);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return true;
  }
  return false;
} 