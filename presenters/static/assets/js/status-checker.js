/**
 * Status Checker Script
 * 
 * Checks the status of application features by making API calls and updating the UI
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if features are already loaded
  if (window.appFeatures && window.appFeatures.length > 0) {
    initStatusCheckers();
  } else {
    // Wait for features to be loaded by feature-loader.js
    document.addEventListener('featuresLoaded', function() {
      initStatusCheckers();
    });
    
    // Handle feature loading errors
    document.addEventListener('featuresError', function(event) {
      const elements = document.querySelectorAll('.status-item');
      elements.forEach(element => {
        element.className = 'error';
        element.textContent = event.detail?.error || 'Failed to load features';
      });
    });
  }
});

/**
 * Initialize all status checkers by checking each feature defined in window.appFeatures
 */
function initStatusCheckers() {
  // Use the global appFeatures variable defined in the HTML
  const features = window.appFeatures || [];
  
  if (features.length === 0) {
    console.warn('No features defined for status checking');
    return;
  }
  
  // Check each feature
  features.forEach(checkFeature);
}

/**
 * Check a specific feature by making an API call and updating the UI
 * @param {Object} feature - Feature configuration object
 */
function checkFeature(feature) {
  if (!feature || !feature.id || !feature.endpoint) {
    console.error('Invalid feature configuration', feature);
    return;
  }
  
  const element = document.getElementById(feature.id);
  if (!element) {
    console.error(`Element not found: #${feature.id}`);
    return;
  }
  
  // Set initial loading state
  updateElementState(element, 'checking', feature.states);
  
  // Fetch the status from the API
  fetch(feature.endpoint)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid content type: Expected JSON');
      }
      
      return response.json();
    })
    .then(data => {
      // Success state
      updateElementState(element, 'success', feature.states, data);
    })
    .catch(error => {
      // Error state
      console.error(`Error checking feature ${feature.id}:`, error);
      updateElementState(element, 'error', feature.states, { error: error.message });
    });
}

/**
 * Update an element's content based on the state
 * @param {HTMLElement} element - The element to update
 * @param {string} state - The state name ('checking', 'success', or 'error')
 * @param {Object} states - The feature's states configuration
 * @param {Object} data - Optional data to include in the message
 */
function updateElementState(element, state, states, data = {}) {
  if (!states || !states[state]) {
    console.warn(`Missing state configuration for '${state}'`);
    element.className = state || 'error';
    element.textContent = JSON.stringify(data) || 'Unknown state';
    return;
  }
  
  const stateConfig = states[state];
  
  // Add state class
  element.className = stateConfig.type || state;
  
  // Update text content
  if (stateConfig.message) {
    let message = stateConfig.message;
    
    // Replace placeholders in the message with actual data
    if (data && typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, value);
      });
    }
    
    element.textContent = message;
  } else {
    // For success state with no message, show the data
    element.textContent = JSON.stringify(data, null, 2);
  }
} 