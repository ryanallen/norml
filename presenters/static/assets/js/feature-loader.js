/**
 * Feature Loader Script
 * 
 * This script fetches feature data from the API and initializes the global
 * appFeatures object that will be used by the status checker.
 * 
 * This approach allows us to maintain a strict Content-Security-Policy
 * without using 'unsafe-inline' or hash-specific scripts.
 */

// Initialize empty features array
window.appFeatures = [];

// Fetch features data from API
document.addEventListener('DOMContentLoaded', function() {
  // Create endpoint URL based on current location
  const apiUrl = `${window.location.origin}/api/features`;
  
  console.log('Feature loader: Fetching features from API');
  
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Set features data in global variable
      window.appFeatures = data;
      console.log('Feature loader: Features loaded successfully', data);
      
      // Dispatch event that status checker can listen for
      const featuresLoadedEvent = new CustomEvent('featuresLoaded');
      document.dispatchEvent(featuresLoadedEvent);
    })
    .catch(error => {
      console.error('Feature loader: Error fetching features:', error);
    });
}); 