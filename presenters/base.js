/**
 * Base Presenter
 * Defines the interface for all presenters without direct dependencies on ports
 */
export class BasePresenter {
  /**
   * Format data for presentation
   * @param {any} data - Data to format
   * @returns {any} - Formatted data
   */
  format(data) {
    throw new Error('Method not implemented: format()');
  }
  
  /**
   * Format error for presentation
   * @param {Error} error - Error to format
   * @returns {any} - Formatted error
   */
  formatError(error) {
    throw new Error('Method not implemented: formatError()');
  }
  
  /**
   * Present data to the response
   * @param {Object} res - HTTP response object
   * @param {any} data - Data to present
   */
  present(res, data) {
    throw new Error('Method not implemented: present()');
  }
  
  /**
   * Present error to the response
   * @param {Object} res - HTTP response object
   * @param {Error} error - Error to present
   */
  presentError(res, error) {
    throw new Error('Method not implemented: presentError()');
  }
}

/**
 * Get standard HTTP response headers
 * @param {string} contentType - Content type of the response
 * @returns {Object} - Headers object
 */
export function getResponseHeaders(contentType) {
  // Standard headers for all responses
  const headers = {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff'
  };
  
  // Add charset for text content types
  if (contentType.startsWith('text/') || 
      contentType === 'application/json' ||
      contentType === 'application/xml') {
    headers['Content-Type'] += '; charset=utf-8';
  }
  
  return headers;
} 