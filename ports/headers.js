// Centralized HTTP headers utility for ports layer
export class ResponseHeaders {
  static getDefaultHeaders() {
    return {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Supported methods
      'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
      'X-Content-Type-Options': 'nosniff', // Prevent MIME type sniffing
      'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
      'Access-Control-Expose-Headers': 'Content-Length, Content-Type' // Expose these headers to the browser
    };
  }

  static getHeadersFor(contentType = 'application/json') {
    const headers = this.getDefaultHeaders();
    headers['Content-Type'] = `${contentType}; charset=utf-8`;
    return headers;
  }
}

export default ResponseHeaders; 