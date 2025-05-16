// Test cleanup port
// This orchestrates test cleanup operations between logic and adapters

// Store references for dependency injection
let cleanupLogic = null;
let cleanupAdapter = null;

/**
 * Initialize this port with the required dependencies
 * @param {Object} deps Dependencies object
 * @param {Function} deps.logic The test cleanup logic function
 * @param {Object} deps.adapter The test cleanup adapter implementation
 */
export function initialize(deps = {}) {
  cleanupLogic = deps.logic || null;
  cleanupAdapter = deps.adapter || null;
  
  console.log('[Test Cleanup Port] Initialized with deps:', {
    hasLogic: !!cleanupLogic,
    hasAdapter: !!cleanupAdapter
  });
  
  return { handleTestCleanup };
}

/**
 * Handle test cleanup requests
 * This port orchestrates the flow between the logic and adapter layers
 * @param {Array<string>} patterns Optional patterns to clean up
 * @returns {Promise<Object>} Result of the cleanup operation
 */
export async function handleTestCleanup(patterns) {
  try {
    // Lazy load dependencies if not injected
    if (!cleanupLogic || !cleanupAdapter) {
      const { cleanupTestOutput: defaultLogic } = !cleanupLogic ? 
        await import('../../logic/test/cleanup.js') : { cleanupTestOutput: null };
      const { testCleanup: defaultAdapter } = !cleanupAdapter ?
        await import('../../adapters/test/cleanup.js') : { testCleanup: null };
      
      cleanupLogic = cleanupLogic || defaultLogic;
      cleanupAdapter = cleanupAdapter || defaultAdapter;
    }
    
    // Pass the adapter to the logic layer
    return await cleanupLogic(cleanupAdapter);
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
  cleanupTestOutput: handleTestCleanup,
  initialize
}; 