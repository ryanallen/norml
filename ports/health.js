// This file lets others check if our system is healthy
import express from 'express';
import dbAdapter from '../adapters/db.js';
import { checkDbStatus } from '../logic/health.js';
import { formatSuccessResponse, getStatusCode } from '../presenters/health.js';

// Create a new web server
const app = express();

// When someone asks "/health/db", check if database is working
app.get('/health/db', async (req, res) => {
  // Check database health
  const statusData = await checkDbStatus(dbAdapter);
  // Make the response look nice
  const response = formatSuccessResponse(statusData);
  // Send back the answer
  res.status(getStatusCode(statusData)).json(response);
});

// When someone asks "/", show them what health checks we have
app.get('/', (req, res) => {
  res.status(200).json({
    api: "NORML Health API",
    endpoints: ["/health/db"]
  });
});

// If someone asks for something we don't have, tell them nicely
app.use((req, res) => {
  res.status(404).json({status: "error", message: "Not found"});
});

// Start listening for health check requests
app.listen(process.env.PORT || 8080); 