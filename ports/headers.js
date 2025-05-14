// Centralized HTTP headers utility for ports layer
export class ResponseHeaders {
  static getDefaultHeaders() {
    return {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Supported methods
      'Access-Control-Allow-Headers': 'Content-Type' // Allowed headers
    };
  }

  static getHeadersFor(contentType = 'application/json') {
    const headers = this.getDefaultHeaders();
    headers['Content-Type'] = contentType;
    return headers;
  }
}

export default ResponseHeaders; 