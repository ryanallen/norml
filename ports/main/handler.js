// Main request handler

// Store presenter reference for dependency injection
let mainPresenter = null;
let mainLogic = null;

/**
 * Initialize this port with the required dependencies
 * @param {Object} deps Dependencies object
 * @param {Object} deps.presenter The main presenter implementation
 * @param {Object} deps.logic The main content logic
 */
export function initialize(deps = {}) {
  mainPresenter = deps.presenter || null;
  mainLogic = deps.logic || null;
  
  console.log('[Main Port] Initialized with deps:', {
    hasPresenter: !!mainPresenter,
    hasLogic: !!mainLogic
  });
  
  return { handleMainRequest };
}

export async function handleMainRequest(req, res) {
  // Handle index page request
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    // Lazy load dependencies if not injected
    if (!mainPresenter || !mainLogic) {
      const { presenter: defaultPresenter } = !mainPresenter ? await import('../../presenters/main/presenter.js') : { presenter: null };
      const { getPageContent: defaultLogic } = !mainLogic ? await import('../../logic/main/content.js') : { getPageContent: null };
      
      mainPresenter = mainPresenter || defaultPresenter;
      mainLogic = mainLogic || defaultLogic;
    }
    
    const content = await mainLogic();
    mainPresenter.present(res, content);
    return true;
  }
  return false;
} 