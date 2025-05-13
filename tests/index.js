// Main test runner
// Import tests for each layer
import './adapters/db.test.js';
import './logic/db-status.test.js';
import './ports/db-status.test.js';
import './presenters/db-status.test.js';

console.log('Running all tests...'); 