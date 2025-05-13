// Server error handling routes
import express from 'express';
import { getErrorDetails } from '../logic/errors-server.js';
import { formatErrorResponse } from '../presenters/errors-server.js';

export const router = express.Router();

// Handle errors
router.use((req, res) => {
  const errorDetails = getErrorDetails(req);
  res.status(errorDetails.status).json(formatErrorResponse(errorDetails));
}); 