/**
 * CORS logic
 */

/**
 * Determine the appropriate Access-Control-Allow-Origin value
 * 
 * @param {string} requestOrigin - The origin of the incoming request
 * @param {string[]} allowedOrigins - List of origins allowed by policy
 * @returns {string} The value to use for Access-Control-Allow-Origin
 */
export function determineAllowedOrigin(requestOrigin, allowedOrigins) {
  // If no origin in request, use safe default
  if (!requestOrigin) {
    return '*';
  }
  
  // Check against whitelist
  if (allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  // Default fallback
  return '*';
}

/**
 * Generate full CORS headers based on request and configuration
 * 
 * @param {string} requestOrigin - The origin of the incoming request
 * @param {string[]} allowedOrigins - List of origins allowed by policy
 * @param {boolean} isPreflight - Whether this is for a preflight request
 * @returns {Object} The complete CORS headers
 */
export function generateCorsHeaders(requestOrigin, allowedOrigins, isPreflight = false) {
  const origin = determineAllowedOrigin(requestOrigin, allowedOrigins);
  
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Origin',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Type'
  };
  
  // Add preflight-specific headers if needed
  if (isPreflight) {
    headers['Access-Control-Max-Age'] = '86400'; // 24 hours
  }
  
  return headers;
} 