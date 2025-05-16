/**
 * Feature Loader Script
 * 
 * Fetches feature data from the API and initializes the global appFeatures object
 */

// Initialize empty features array
window.appFeatures = [];

// Fetch features data from API
document.addEventListener('DOMContentLoaded', function() {
  // Use the injected API_BASE_URL or fall back to current origin
  const apiBase = window.API_BASE_URL || window.location.origin;
  const apiUrl = `${apiBase}/api/features`;
  
  console.log('Feature loader: Using API base:', apiBase);
  console.log('Feature loader: Fetching features from API');
  
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      // Explicitly check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid content type: Expected JSON');
      }
      return response.json();
    })
    .then(data => {
      // Validate data is an array
      if (!Array.isArray(data)) {
        console.warn('Feature loader: Expected array but received:', typeof data);
        window.appFeatures = [];
        return;
      }
      
      // Set features data in global variable
      window.appFeatures = data;
      console.log('Feature loader: Features loaded successfully', data);
      
      // Dispatch event that status checker can listen for
      const featuresLoadedEvent = new CustomEvent('featuresLoaded');
      document.dispatchEvent(featuresLoadedEvent);
    })
    .catch(error => {
      console.error('Feature loader: Error fetching features:', error);
      // Dispatch error event so UI can be updated
      const errorEvent = new CustomEvent('featuresError', { detail: { error: error.message } });
      document.dispatchEvent(errorEvent);
    });
}); 