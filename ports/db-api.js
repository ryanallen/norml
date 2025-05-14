// Database API endpoints port
import { presenter } from '../presenters/db.js';
import { ResponseHeaders } from './headers.js';

export async function handleRequest(req, res) {
  // Handle database API endpoints
  switch (req.url) {
    case '/api/db/status':
      if (req.method === 'GET') {
        return handleStatusRequest(req, res);
      }
      break;
      
    case '/api/db/stats':
      if (req.method === 'GET') {
        return handleStatsRequest(req, res);
      }
      break;
      
    case '/api/db/ping':
      if (req.method === 'GET') {
        return handlePingRequest(req, res);
      }
      break;
  }
  
  return false;
}

async function handleStatusRequest(req, res) {
  try {
    const status = await req.db.getStatus();
    
    // Use ResponseHeaders directly for proper Cache-Control
    const headers = ResponseHeaders.getHeadersFor('application/json');
    res.writeHead(200, headers);
    res.end(JSON.stringify(presenter.format(status)));
    
    return true;
  } catch (error) {
    presenter.presentError(res, error);
    return true;
  }
}

async function handleStatsRequest(req, res) {
  try {
    const stats = await req.db.getStats();
    
    // Use ResponseHeaders directly for proper Cache-Control
    const headers = ResponseHeaders.getHeadersFor('application/json');
    res.writeHead(200, headers);
    res.end(JSON.stringify(presenter.format(stats)));
    
    return true;
  } catch (error) {
    presenter.presentError(res, error);
    return true;
  }
}

async function handlePingRequest(req, res) {
  try {
    const ping = await req.db.ping();
    
    // Use ResponseHeaders directly for proper Cache-Control
    const headers = ResponseHeaders.getHeadersFor('application/json');
    res.writeHead(200, headers);
    res.end(JSON.stringify(presenter.format(ping)));
    
    return true;
  } catch (error) {
    presenter.presentError(res, error);
    return true;
  }
} 