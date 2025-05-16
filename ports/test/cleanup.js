// Test cleanup port
// This orchestrates test cleanup operations between logic and adapters
import { cleanupTestOutput } from '../../logic/test/cleanup.js';
import { testCleanup } from '../../adapters/test/cleanup.js';

/**
 * Handle test cleanup requests
 * This port orchestrates the flow between the logic and adapter layers
 * @param {Array<string>} patterns Optional patterns to clean up
 * @returns {Promise<Object>} Result of the cleanup operation
 */
export async function handleTestCleanup(patterns) {
  try {
    // Pass the adapter to the logic layer
    return await cleanupTestOutput(testCleanup);
  } catch (error) {
    console.error('Error in test cleanup port:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

export default {
  cleanupTestOutput: handleTestCleanup
}; 