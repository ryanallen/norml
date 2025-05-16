/**
 * Features API Presenter
 */

import { BasePresenter, getResponseHeaders } from '../base.js';

export class FeaturesPresenter extends BasePresenter {
  /**
   * Format the features data for API response
   * @param {Array} features - Features data
   * @returns {Array} Formatted features
   */
  format(features) {
    if (!features) {
      return [];
    }
    
    // Format each feature for API response
    // This is a pure formatting operation - no business logic
    return features.map(feature => ({
      id: feature.id,
      name: feature.name,
      endpoint: feature.endpoint,
      states: feature.states
    }));
  }
  
  /**
   * Present features data to the response
   * @param {Object} res - HTTP response object
   * @param {Array} features - Features data
   * @param {string} requestOrigin - Optional origin for CORS
   */
  present(res, features, requestOrigin = null) {
    const headers = getResponseHeaders('application/json', null, requestOrigin);
    res.writeHead(200, headers);
    res.end(JSON.stringify(this.format(features)));
  }
  
  /**
   * Present error to the response
   * @param {Object} res - HTTP response object
   * @param {Error} error - Error to present
   * @param {string} requestOrigin - Optional origin for CORS
   * @param {number} statusCode - HTTP status code (default 500)
   */
  presentError(res, error, requestOrigin = null, statusCode = 500) {
    const headers = getResponseHeaders('application/json', null, requestOrigin);
    res.writeHead(statusCode, headers);
    res.end(JSON.stringify({
      error: error.message || 'Unknown error'
    }));
  }
} 