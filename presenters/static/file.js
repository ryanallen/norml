import { BasePresenter, getResponseHeaders } from '../base.js';

/**
 * Static File Presenter
 * Formats static file responses to send to clients
 */
export class StaticFilePresenter extends BasePresenter {
  /**
   * Format a successful static file response
   * @param {Buffer} fileContent - The file content to serve
   * @returns {Object} - Formatted response
   */
  format(fileContent) {
    // For static files, we just return the raw file content
    // No transformation needed
    return fileContent;
  }
  
  /**
   * Format an error response for static file requests
   * @param {Error} error - The error that occurred
   * @returns {Object} - Formatted error response
   */
  formatError(error) {
    return {
      error: 'Static File Error',
      message: error.message,
      status: error.status || 500,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Present a static file to the client
   * @param {http.ServerResponse} res - HTTP response object
   * @param {Buffer|string} content - File content
   * @param {Object} headers - Response headers
   */
  present(res, content, headers = {}) {
    // Set response headers
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Set status and send response
    res.statusCode = 200;
    res.end(content);
  }
  
  /**
   * Present an error response for static file requests
   * @param {http.ServerResponse} res - HTTP response object
   * @param {Error} error - Error object
   * @param {Object} headers - Additional headers to include
   */
  presentError(res, error, headers = {}) {
    const status = error.status || 500;
    const errorResponse = this.formatError(error);
    
    // Set response headers
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Set default content type if not already set
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    
    // Apply security headers if not already set
    if (!res.getHeader('X-Content-Type-Options')) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    
    // Set status and send error message
    res.statusCode = status;
    res.end(JSON.stringify(errorResponse));
  }
}

// Create singleton instance
export const presenter = new StaticFilePresenter(); 