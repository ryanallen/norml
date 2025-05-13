// API endpoint - Handles HTTP requests and routes
import express from 'express';
import dbAdapter from '../adapters/db.js';
import { checkDbStatus } from '../logic/db-status.js';
import { formatSuccessResponse, getStatusCode } from '../presenters/db-status.js';

const app = express();

// Database status endpoint - Returns MongoDB connection status
app.get('/api/db/status', async (req, res) => {
  // Get status from business logic
  const statusData = await checkDbStatus(dbAdapter);
  // Format for HTTP response using presenter
  const response = formatSuccessResponse(statusData);
  // Send with appropriate status code
  res.status(getStatusCode(statusData)).json(response);
});

// Root endpoint - API documentation
app.get('/', (req, res) => {
  res.status(200).json({
    api: "NORML API",
    endpoints: ["/api/db/status"]
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({status: "error", message: "Not found"});
});

// Start the server on specified port or default to 8080
app.listen(process.env.PORT || 8080); 