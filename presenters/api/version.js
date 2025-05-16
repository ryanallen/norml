/**
 * Version information presenter
 * Formats version information for the API response
 */

import { BasePresenter } from '../base.js';
import { ResponseHeaders } from '../../ports/core/headers.js';

export class VersionPresenter extends BasePresenter {
  /**
   * Format version data for presentation
   * @param {Object} data Version data
   * @returns {Object} Formatted version data
   */
  format(data) {
    return {
      ...data,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Format error for presentation
   * @param {Error} error Error to format
   * @returns {Object} Formatted error
   */
  formatError(error) {
    return {
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Present version data to the client
   * @param {Object} res Response object
   * @param {Object} data Version data
   * @param {string} requestOrigin Optional origin for CORS headers
   */
  present(res, data, requestOrigin = null) {
    const headers = ResponseHeaders.getHeadersFor('application/json', null, requestOrigin);
    res.writeHead(200, headers);
    res.end(JSON.stringify(this.format(data)));
  }
  
  /**
   * Present an error to the client
   * @param {Object} res Response object
   * @param {Error} error Error that occurred
   * @param {string} requestOrigin Optional origin for CORS headers
   */
  presentError(res, error, requestOrigin = null) {
    const headers = ResponseHeaders.getHeadersFor('application/json', null, requestOrigin);
    res.writeHead(500, headers);
    res.end(JSON.stringify(this.formatError(error)));
  }
}

// Export a singleton instance
export const presenter = new VersionPresenter(); 