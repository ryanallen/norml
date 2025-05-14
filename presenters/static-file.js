// Static file presenter
// Formats static file responses for the client
import { Presenter } from '../ports/interfaces.js';
import { ResponseHeaders } from '../ports/headers.js';

export class StaticFilePresenter extends Presenter {
  /**
   * Format a successful static file response
   * @param {Buffer} fileContent - The file content to serve
   * @param {Object} headers - HTTP headers to include
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
   * @param {Object} res - HTTP response object
   * @param {Buffer} fileContent - File content to serve
   * @param {Object} headers - HTTP headers to include
   */
  present(res, fileContent, headers) {
    res.writeHead(200, headers);
    res.end(this.format(fileContent));
  }
  
  /**
   * Present an error to the client
   * @param {Object} res - HTTP response object
   * @param {Error} error - The error that occurred
   * @param {Object} customHeaders - Optional custom headers to include
   */
  presentError(res, error, customHeaders = null) {
    const status = error.status || 500;
    const errorResponse = this.formatError(error);
    
    // Use ResponseHeaders to get proper security headers
    const contentType = customHeaders && customHeaders['Content-Type'] ? 
      customHeaders['Content-Type'] : 'application/json';
    
    const headers = ResponseHeaders.getHeadersFor(contentType);
    
    res.writeHead(status, headers);
    res.end(JSON.stringify(errorResponse));
  }
}

export const presenter = new StaticFilePresenter(); 