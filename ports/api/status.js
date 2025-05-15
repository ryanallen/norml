// API status endpoint
import { handleRequest } from '../db/db-status.js';

export async function handleStatusRequest(req, res) {
  return handleRequest(req, res);
} 