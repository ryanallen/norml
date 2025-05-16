/**
 * Process a static file request
 * 
 * @param {Object} request - Request information
 * @param {string} request.path - File path
 * @param {boolean} request.exists - Whether the file exists
 * @param {string} request.mimeType - MIME type of the file
 * @returns {Object} Result containing success status, headers, and error info
 */

import crypto from 'node:crypto';

export function processStaticFileRequest(fileInfo) {
  const { path, exists, mimeType } = fileInfo;
  
  // Check if path is safe
  if (!isPathSafe(path)) {
    return {
      success: false,
      status: 403,
      error: 'Path contains potentially unsafe characters'
    };
  }
  
  // Check if file exists
  if (!exists) {
    return {
      success: false,
      status: 404,
      error: 'File not found'
    };
  }
  
  // Determine cache policy
  const cacheControl = determineCachePolicy(mimeType);
  
  // Build response headers
  const headers = {
    ...getSecurityHeaders(),
    'Cache-Control': cacheControl
  };
  
  // Add Content-Type with or without charset
  if (shouldIncludeCharset(mimeType)) {
    headers['Content-Type'] = `${mimeType}; charset=utf-8`;
  } else {
    headers['Content-Type'] = mimeType;
  }
  
  return {
    success: true,
    status: 200,
    headers
  };
}

/**
 * Determines if a path is safe (no directory traversal)
 * @param {string} path - The file path to check
 * @returns {boolean} - True if path is safe
 */
export function isPathSafe(path) {
  return !path.includes('..');
}

/**
 * Determines the appropriate cache control policy for a content type
 * @param {string} mimeType - The MIME type of the file
 * @returns {string} - Appropriate cache control header value
 */
export function determineCachePolicy(mimeType) {
  if (mimeType.startsWith('image/')) {
    // Cache images for a day with revalidation
    return 'public, max-age=86400, must-revalidate';
  } else if (mimeType === 'text/html') {
    // Don't cache HTML but ensure must-revalidate is included
    return 'no-store, must-revalidate';
  } else if (mimeType === 'application/json') {
    // Don't cache API responses but ensure must-revalidate is included
    return 'no-store, must-revalidate';
  } else if (mimeType === 'text/plain') {
    // Cache text files but revalidate
    return 'public, max-age=14400, must-revalidate';
  } else {
    // Default cache policy
    return 'public, max-age=14400, must-revalidate';
  }
}

/**
 * Determines if charset should be included for a given MIME type
 * @param {string} mimeType - The MIME type to check
 * @returns {boolean} - True if charset should be included
 */
export function shouldIncludeCharset(mimeType) {
  return !(
    mimeType.startsWith('image/') || 
    mimeType === 'application/octet-stream' ||
    mimeType.startsWith('font/') ||
    mimeType === 'application/pdf'
  );
}

/**
 * Creates appropriate security headers for responses
 * @returns {Object} - Security headers
 */
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': getContentSecurityPolicy()
  };
}

/**
 * Generates a secure Content Security Policy
 *
 * CLOUDFLARE UPDATE INSTRUCTIONS:
 * default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://norml-459701.uc.r.appspot.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
 * 
 * @returns {string} - CSP header value
 */
export function getContentSecurityPolicy() {
  return [
    // Restrictive default policy
    "default-src 'self'",
    
    // Script sources - external scripts only, no inline or eval
    "script-src 'self'",
    
    // Style sources - keep unsafe-inline for now
    "style-src 'self' 'unsafe-inline'",
    
    // Keep existing connect-src
    "connect-src 'self' https://norml-459701.uc.r.appspot.com",
    
    // Additional hardening
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'"
  ].join('; ');
} 