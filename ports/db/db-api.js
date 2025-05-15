// Database API endpoints port
import { presenter } from '../../presenters/db/db.js';

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
    presenter.present(res, status);
    return true;
  } catch (error) {
    presenter.presentError(res, error);
    return true;
  }
}

async function handleStatsRequest(req, res) {
  try {
    const stats = await req.db.getStats();
    presenter.present(res, stats);
    return true;
  } catch (error) {
    presenter.presentError(res, error);
    return true;
  }
}

async function handlePingRequest(req, res) {
  try {
    const ping = await req.db.ping();
    presenter.present(res, ping);
    return true;
  } catch (error) {
    presenter.presentError(res, error);
    return true;
  }
} 