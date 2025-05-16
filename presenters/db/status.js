// Database status presenter
// Used to format database status response for clients

import { BasePresenter } from '../base.js';
import { ResponseHeaders } from '../../ports/core/headers.js';

export class DbStatusPresenter extends BasePresenter {
  /**
   * Format database status for presentation
   * @param {Object} status Database status data
   * @returns {Object} Formatted status
   */
  format(status) {
    return {
      ...status,
      formatted: true,
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
   * Present database status to the client
   * @param {Object} res Response object
   * @param {Object} status Status data
   * @param {string} requestOrigin Optional origin for CORS headers
   */
  present(res, status, requestOrigin = null) {
    const code = status.connected ? 200 : 503;
    const headers = ResponseHeaders.getHeadersFor('application/json', null, requestOrigin);
    res.writeHead(code, headers);
    res.end(JSON.stringify(this.format(status), null, 2));
  }
  
  /**
   * Present an error to the client
   * @param {Object} res Response object
   * @param {Error} error Error that occurred
   * @param {string} requestOrigin Optional origin for CORS headers
   */
  presentError(res, error, requestOrigin = null) {
    const headers = ResponseHeaders.getHeadersFor('application/json', null, requestOrigin);
    res.writeHead(503, headers);
    res.end(JSON.stringify(this.formatError(error)));
  }
}

// Export a singleton instance
export const presenter = new DbStatusPresenter(); 