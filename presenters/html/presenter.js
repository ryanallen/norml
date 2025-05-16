import { BasePresenter, getResponseHeaders } from '../base.js';
import { getContentSecurityPolicy } from '../../logic/static/file.js';

/**
 * HTML Presenter for formatting content as HTML
 */
export class HtmlPresenter extends BasePresenter {
  /**
   * Format the data as HTML
   * @param {Object} data - The data to format
   * @param {Object} options - Additional options
   * @param {string} options.scriptNonce - Nonce for script tags
   * @param {string} options.styleNonce - Nonce for style tags
   * @returns {string} HTML string
   */
  format(data, options = {}) {
    if (!data) {
      return this.formatError(new Error('No data provided'));
    }
    
    try {
      const { title, description, repoUrl, features } = data;
      const { scriptNonce, styleNonce } = options;
      
      // Features section HTML
      const featuresHtml = features ? features.map(feature => `
    <div>
      <h2>${feature.name}</h2>
      <div id="${feature.id}">
        ${feature.states?.checking?.message || 'Loading...'}
      </div>
    </div>
  `).join('\n  ') : '';
      
      // Serialize features for client-side JavaScript
      const featuresJson = features ? JSON.stringify(features) : '[]';
      
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <title>${title}</title>
  <script src="/presenters/static/assets/js/status-checker.js"></script>
</head>
<body>
  <div>
    <h1>${title}</h1>
    <p>${description}</p>
    <a href="${repoUrl}" target="_blank">View on GitHub</a>
  </div>
  
  ${featuresHtml}

  <script${scriptNonce ? ` nonce="${scriptNonce}"` : ''}>
    // Pre-define features in a global variable for the status checker
    window.appFeatures = ${featuresJson};
  </script>
</body>
</html>`;
    } catch (error) {
      return this.formatError(error);
    }
  }
  
  /**
   * Format an error as HTML
   * @param {Error} error - The error to format
   * @returns {string} HTML string
   */
  formatError(error) {
    const message = error?.message || 'Unknown error';
    return `<!DOCTYPE html>
<html>
<head>
  <title>Error</title>
</head>
<body>
  <h1>Error</h1>
  <p>${message}</p>
</body>
</html>`;
  }
  
  /**
   * Present data to the response
   * @param {Object} res - HTTP response object
   * @param {any} data - Data to present
   * @param {string} requestOrigin - Optional origin for CORS headers
   */
  present(res, data, requestOrigin = null) {
    // Get CSP policy
    const policy = getContentSecurityPolicy();
    
    // Extract nonces from the policy
    const scriptNonce = policy.match(/script-src[^;]*'nonce-([^']+)'/)?.[1];
    const styleNonce = policy.match(/style-src[^;]*'nonce-([^']+)'/)?.[1];
    
    // Add CSP header to response
    const headers = {
      ...getResponseHeaders('text/html'),
      'Content-Security-Policy': policy
    };
    
    res.writeHead(200, headers);
    res.end(this.format(data, { scriptNonce, styleNonce }));
  }
  
  /**
   * Present error to the response
   * @param {Object} res - HTTP response object
   * @param {Error} error - Error to present
   * @param {string} requestOrigin - Optional origin for CORS headers
   */
  presentError(res, error, requestOrigin = null) {
    // Get CSP policy
    const policy = getContentSecurityPolicy();
    
    // Add CSP header to response
    const headers = {
      ...getResponseHeaders('text/html'),
      'Content-Security-Policy': policy
    };
    
    res.writeHead(500, headers);
    res.end(this.formatError(error));
  }
}