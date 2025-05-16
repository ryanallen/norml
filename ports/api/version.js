// Version endpoint

// Store adapter and presenter references for dependency injection
let versionAdapter = null;
let versionPresenter = null;
let configAdapter = null;

/**
 * Initialize this port with the required dependencies
 * @param {Object} deps Dependencies object
 * @param {Object} deps.adapter The version adapter implementation
 * @param {Object} deps.presenter The version presenter implementation
 * @param {Object} deps.config The config adapter implementation
 */
export function initialize(deps = {}) {
  versionAdapter = deps.adapter || null;
  versionPresenter = deps.presenter || null;
  configAdapter = deps.config || null;
  
  console.log('[Version Port] Initialized with deps:', {
    hasAdapter: !!versionAdapter,
    hasPresenter: !!versionPresenter,
    hasConfig: !!configAdapter
  });
  
  return { handleVersionRequest };
}

export async function handleVersionRequest(req, res) {
  // Lazy load dependencies if not injected
  if (!versionAdapter || !versionPresenter || !configAdapter) {
    const { getVersion, getBuildInfo } = await import('../../logic/version/version.js');
    const { VersionAdapter } = !versionAdapter ? await import('../../adapters/version/adapter.js') : { VersionAdapter: null };
    const { presenter: defaultPresenter } = !versionPresenter ? await import('../../presenters/api/version.js') : { presenter: null };
    const { config: defaultConfig } = !configAdapter ? await import('../../adapters/env/config.js') : { config: null };
    
    versionAdapter = versionAdapter || new VersionAdapter();
    versionPresenter = versionPresenter || defaultPresenter;
    configAdapter = configAdapter || defaultConfig;
  }
  
  // Import logic functions
  const { getVersion, getBuildInfo } = await import('../../logic/version/version.js');
  
  if (req.method === 'GET' && req.url === '/api/version') {
    try {
      const result = await getVersion(versionAdapter);
      versionPresenter.present(res, result);
      return true;
    } catch (error) {
      versionPresenter.presentError(res, error);
      return true;
    }
  } else if (req.method === 'GET' && req.url === '/api/build-info') {
    try {
      const result = await getBuildInfo(configAdapter);
      versionPresenter.present(res, result);
      return true;
    } catch (error) {
      versionPresenter.presentError(res, error);
      return true;
    }
  }
  return false;
} 