// Database status endpoint
// It checks if the database is working and tells the browser about it

// Store adapter and presenter references for dependency injection
let dbAdapter = null;
let dbPresenter = null;

/**
 * Initialize this port with the required dependencies
 * @param {Object} deps Dependencies object
 * @param {Object} deps.adapter The database adapter implementation
 * @param {Object} deps.presenter The database presenter implementation
 */
export function initialize(deps = {}) {
  dbAdapter = deps.adapter || null;
  dbPresenter = deps.presenter || null;
  
  console.log('[DB Status Port] Initialized with deps:', {
    hasAdapter: !!dbAdapter,
    hasPresenter: !!dbPresenter
  });
  
  return { handleRequest };
}

// Handle a request to check database status
export async function handleRequest(req, res, context = {}, testAdapter) {
  if (req.method === 'GET' && (req.url === '/api/status' || req.url === '/api/status/db')) {
    try {
      // Lazy load dependencies if not injected
      if (!dbAdapter || !dbPresenter) {
        const { db } = !dbAdapter ? await import('../../adapters/db/mongodb.js') : { db: null };
        const { presenter: defaultPresenter } = !dbPresenter ? await import('../../presenters/db/status.js') : { presenter: null };
        
        dbAdapter = dbAdapter || db;
        dbPresenter = dbPresenter || defaultPresenter;
      }
      
      // Allow test adapter override for testing
      const adapter = testAdapter || dbAdapter;
      console.log('[DB Port] Using adapter:', testAdapter ? 'test' : 'default');
      
      // Get basic connection status
      await adapter.connect();
      const status = await adapter.getStatus();

      // Add ping information
      const ping = await adapter.ping();
      status.ping = ping;

      // Add server stats if connection is successful
      if (status.connected) {
        const serverStats = await adapter.getStats();
        if (serverStats.success) {
          status.stats = serverStats.stats;
        }
      }

      // Disconnect after gathering all info
      await adapter.disconnect();

      console.log('[DB Port] Got comprehensive status:', status);
      
      // Extract request origin from context
      const { requestOrigin } = context || {};
      
      // Use the presenter to format and deliver the response
      dbPresenter.present(res, status, requestOrigin);
      
      return true;
    } catch (error) {
      console.log('[DB Port] Got error:', error);
      
      // Ensure presenter is available for error case
      if (!dbPresenter) {
        const { presenter: defaultPresenter } = await import('../../presenters/db/status.js');
        dbPresenter = defaultPresenter;
      }
      
      // Extract request origin from context
      const { requestOrigin } = context || {};
      
      dbPresenter.presentError(res, error, requestOrigin);
      return true;
    }
  }
  return false;
} 