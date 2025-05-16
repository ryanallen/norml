// Centralized HTTP headers utility for ports layer
import { 
  shouldIncludeCharset, 
  determineCachePolicy,
  getSecurityHeaders 
} from '../../logic/static/file.js';

import { generateCorsHeaders } from '../../logic/static/cors.js';
import { corsConfig } from '../../adapters/env/cors-config.js';

export class ResponseHeaders {
  static getDefaultHeaders(requestOrigin = null) {
    // IMPORTANT: Cloudflare has the following CSP headers set that we need to coordinate with:
    // default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
    // style-src 'self' 'unsafe-inline'; connect-src 'self' https://norml-459701.uc.r.appspot.com;
    
    // Use the CORS logic to generate proper headers based on request origin
    const corsHeaders = generateCorsHeaders(
      requestOrigin, 
      corsConfig.getAllowedOrigins()
    );
    
    return {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...getSecurityHeaders(),
      'Cache-Control': 'no-store'
    };
  }

  static getHeadersFor(contentType = 'application/json', cacheControl = null, requestOrigin = null) {
    const headers = this.getDefaultHeaders(requestOrigin);
    
    // Use logic layer to determine if charset should be included
    if (shouldIncludeCharset(contentType)) {
      headers['Content-Type'] = `${contentType}; charset=utf-8`;
    } else {
      headers['Content-Type'] = contentType;
    }
    
    // Use logic layer to determine cache control policy
    headers['Cache-Control'] = cacheControl || determineCachePolicy(contentType);
    
    return headers;
  }
  
  /**
   * Get preflight response headers for OPTIONS requests
   * 
   * @param {string} requestOrigin - The origin of the incoming request
   * @returns {Object} Headers for preflight response
   */
  static getPreflightHeaders(requestOrigin = null) {
    const corsHeaders = generateCorsHeaders(
      requestOrigin, 
      corsConfig.getAllowedOrigins(),
      true // isPreflight = true
    );
    
    return {
      ...corsHeaders,
      ...getSecurityHeaders(),
      'Content-Type': 'text/plain',
      'Content-Length': '0'
    };
  }
}

export default ResponseHeaders; 