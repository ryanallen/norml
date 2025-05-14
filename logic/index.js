// Index page logic
export function getPageContent() {
  return {
    title: 'NORML App Status',
    description: 'Node.js application implementing RHOMBUS architecture',
    repoUrl: 'https://github.com/ryanallen/norml',
    features: [
      {
        id: 'db-status',
        name: 'Database Status',
        endpoint: '/api/status',
        states: {
          checking: { type: 'loading', message: 'Checking...' },
          success: { type: 'success' },
          error: { type: 'error', message: 'Error checking status: {error}' }
        }
      },
      {
        id: 'version-info',
        name: 'Version',
        endpoint: '/api/version',
        states: {
          checking: { type: 'loading', message: 'Loading...' },
          success: { type: 'success' },
          error: { type: 'error', message: 'Error loading version' }
        }
      }
    ]
  };
}

// API response handling logic
export function handleApiResponse(response, error) {
  if (error) {
    return {
      state: 'error',
      error: error.message
    };
  }

  if (!response.ok) {
    return {
      state: 'error',
      error: `HTTP error! status: ${response.status}`
    };
  }

  return {
    state: 'success',
    data: response
  };
}

// Status response handling logic
export function handleStatusResponse(data) {
  return {
    state: data.status === 'available' ? 'success' : 'error',
    data: data
  };
}

// API call handling logic
export function getApiCallHandler() {
  return `
    async function callApi(endpoint) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('API call failed:', error);
        return { success: false, error: error.message };
      }
    }
  `;
} 