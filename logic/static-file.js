// Static file logic
// Contains business rules for static file handling

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
    // Don't cache HTML
    return 'no-store';
  } else if (mimeType === 'application/json') {
    // Don't cache API responses
    return 'no-store';
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
    'Content-Security-Policy': "default-src * 'self' data: blob: https:; script-src * 'self' 'unsafe-inline'; style-src * 'self' 'unsafe-inline'; frame-ancestors 'self';",
    'X-Frame-Options': 'SAMEORIGIN'
  };
}

/**
 * Handles static file request processing logic
 * @param {Object} fileInfo - Information about the requested file
 * @returns {Object} - Response information including headers and status
 */
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