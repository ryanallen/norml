// Index page port
import { formatIndexPage } from '../presenters/index.js';
import { getPageContent } from '../logic/index.js';
import { getVersion } from '../logic/version.js';

export async function handleRequest(req, res) {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    console.log('[Index Port] Handling request:', req.url);
    
    const baseContent = getPageContent();
    const version = getVersion();
    
    const content = {
      ...baseContent,
      version
    };
    console.log('[Index Port] Combined content with version:', { title: content.title, version: content.version });
    
    const html = formatIndexPage(content);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return true;
  }
  return false;
} 