// Database status check routes
import express from 'express';
import dbAdapter from '../adapters/db.js';
import { checkDbStatus } from '../logic/db-status.js';
import { formatSuccessResponse, getStatusCode } from '../presenters/db-status.js';

export const router = express.Router();

// Check if database is working
router.get('/db', async (req, res) => {
  // Check database health
  const statusData = await checkDbStatus(dbAdapter);
  // Make the response look nice
  const response = formatSuccessResponse(statusData);
  // Send back the answer
  res.status(getStatusCode(statusData)).json(response);
}); 