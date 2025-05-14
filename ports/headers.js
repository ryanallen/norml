// Standard HTTP headers utility for the ports layer
// Centralizes header management for all responses

export class ResponseHeaders {
  static getDefaultHeaders() {
    return {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
  }

  static getHeadersFor(contentType = 'application/json') {
    const headers = this.getDefaultHeaders();
    headers['Content-Type'] = contentType;
    return headers;
  }
}

export default ResponseHeaders; 