import http from 'node:http';
import { handleRequest as handleDbStatus } from '../ports/db-status.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFile } from 'node:fs/promises';

// Get the directory this file is in (needed to find index.html)
const __dirname = dirname(fileURLToPath(import.meta.url));

const server = http.createServer(async (req, res) => {
  // Try db status endpoint first
  if (await handleDbStatus(req, res)) {
    return;
  }

  // Serve index.html for root path
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    try {
      const content = await readFile(join(__dirname, '../index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
      return;
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading index.html');
      return;
    }
  }

  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Handle a request by deciding what response to send back
export async function handleRequest(req) {
  // If they asked for the homepage, send them index.html
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    try {
      // Try to read the index.html file
      const content = await readFile(join(__dirname, '../index.html'), 'utf8');
      // Tell the port layer to send it back as HTML
      return {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
        body: content
      };
    } catch (error) {
      // If we couldn't read the file, tell the port layer to send an error
      return {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Error loading index.html'
      };
    }
  }

  // If we don't recognize the URL, tell the port layer to send 404
  return {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
    body: 'Not Found'
  };
} 