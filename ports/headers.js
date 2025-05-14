// Centralized HTTP headers utility for ports layer
import { 
  shouldIncludeCharset, 
  determineCachePolicy,
  getSecurityHeaders 
} from '../logic/static-file.js';

export class ResponseHeaders {
  static getDefaultHeaders() {
    return {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Supported methods
      'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
      'X-Content-Type-Options': 'nosniff',
      ...getSecurityHeaders(),
      'Cache-Control': 'no-store', // Prevent caching without must-revalidate
      'Access-Control-Expose-Headers': 'Content-Length, Content-Type' // Expose these headers to the browser
    };
  }

  static getHeadersFor(contentType = 'application/json', cacheControl = null) {
    const headers = this.getDefaultHeaders();
    
    // Use logic layer to determine if charset should be included
    if (shouldIncludeCharset(contentType)) {
      headers['Content-Type'] = `${contentType}; charset=utf-8`;
    } else {
      headers['Content-Type'] = contentType;
    }
    
    // Use logic layer to determine cache control policy
    headers['Cache-Control'] = cacheControl || determineCachePolicy(contentType);
    
    // Add CORS and security headers
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Expose-Headers'] = 'Content-Length, Content-Type';
    headers['X-Content-Type-Options'] = 'nosniff';
    
    return headers;
  }
}

export default ResponseHeaders; 