// MongoDB API endpoints port
import { presenter } from '../presenters/mongodb.js';

export async function handleRequest(req, res) {
  // Handle MongoDB API endpoints
  switch (req.url) {
    case '/api/mongodb/status':
      if (req.method === 'GET') {
        return handleStatusRequest(req, res);
      }
      break;
      
    case '/api/mongodb/stats':
      if (req.method === 'GET') {
        return handleStatsRequest(req, res);
      }
      break;
      
    case '/api/mongodb/ping':
      if (req.method === 'GET') {
        return handlePingRequest(req, res);
      }
      break;
  }
  
  return false;
}

async function handleStatusRequest(req, res) {
  try {
    const status = await req.mongodb.getStatus();
    presenter.present(res, status);
    return true;
  } catch (error) {
    presenter.presentError(res, error);
    return true;
  }
}

async function handleStatsRequest(req, res) {
  try {
    const stats = await req.mongodb.getStats();
    presenter.present(res, stats);
    return true;
  } catch (error) {
    presenter.presentError(res, error);
    return true;
  }
}

async function handlePingRequest(req, res) {
  try {
    const ping = await req.mongodb.ping();
    presenter.present(res, ping);
    return true;
  } catch (error) {
    presenter.presentError(res, error);
    return true;
  }
} 