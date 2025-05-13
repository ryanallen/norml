// Server infrastructure adapter
import express from 'express';
import { router as dbStatusRoutes } from '../ports/db-status-server.js';
import { router as staticRoutes } from '../ports/static-server.js';
import { router as errorRoutes } from '../ports/errors-server.js';

// Create and configure Express server
export function createServer() {
  const app = express();
  
  // Mount routes in order
  app.use('/', staticRoutes);      // Static files first
  app.use('/db-status', dbStatusRoutes); // DB status check second
  app.use(errorRoutes);            // Error handling last
  
  return app;
}

// Start server if this module is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
} 