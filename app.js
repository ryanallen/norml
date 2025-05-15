// Main application entry point for NORML App
// Following RHOMBUS architecture with clear layer separation

// Load environment variables and secrets first
import { secrets } from './adapters/env/secrets.js';

// Load configuration from secrets file
try {
  // Load from secrets.json following RHOMBUS architecture
  secrets.loadAll();
  
  // Log essential environment variables for debugging
  console.log('[App] Environment configuration:');
  console.log('- PORT:', secrets.get('PORT', '3001 (default)'));
  console.log('- NODE_ENV:', secrets.get('NODE_ENV', 'development (default)'));
  console.log('- MONGODB_URI:', secrets.has('MONGODB_URI') ? 'Configured' : 'Not configured');
  console.log('- GCP_PROJECT_ID:', secrets.get('GCP_PROJECT_ID', 'Not configured'));
} catch (error) {
  console.warn('[App] Configuration warning:', error.message);
}

// Import necessary modules to start the server
import { startServer } from './ports/core/server.js';

// Start the server with default port from environment
startServer(); 