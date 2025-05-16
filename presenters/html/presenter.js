import { BasePresenter, getResponseHeaders } from '../base.js';
import { getContentSecurityPolicy } from '../../logic/static/file.js';
import { secrets } from '../../adapters/env/secrets.js';

/**
 * HTML Presenter for formatting content as HTML
 */
export class HtmlPresenter extends BasePresenter {
  /**
   * Format the data as HTML
   * @param {Object} data - The data to format
   * @returns {string} HTML string
   */
  format(data) {
    if (!data) {
      return this.formatError(new Error('No data provided'));
    }
    
    try {
      const { title, description, repoUrl, features } = data;
      
      // Get API base URL from environment or use a default
      const apiBaseUrl = secrets.get('API_BASE') || 'https://norml-459701.uc.r.appspot.com';
      
      // Features section HTML
      const featuresHtml = features ? features.map(feature => `
    <div>
      <h2>${feature.name}</h2>
      <div id="${feature.id}">
        ${feature.states?.checking?.message || 'Loading...'}
      </div>
    </div>
  `).join('\n  ') : '';
      
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <title>${title}</title>
  <!-- Inject API base URL before loading scripts -->
  <script>
    window.API_BASE_URL = "${apiBaseUrl}";
  </script>
  <!-- Load feature loader first, then status checker -->
  <script src="/presenters/static/assets/js/feature-loader.js"></script>
  <script src="/presenters/static/assets/js/status-checker.js"></script>
</head>
<body>
  <div>
    <h1>${title}</h1>
    <p>${description}</p>
    <a href="${repoUrl}" target="_blank">View on GitHub</a>
  </div>
  
  ${featuresHtml}
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
    const headers = {
      ...getResponseHeaders('text/html'),
      'Content-Security-Policy': getContentSecurityPolicy()
    };
    
    res.writeHead(200, headers);
    res.end(this.format(data));
  }
  
  /**
   * Present error to the response
   * @param {Object} res - HTTP response object
   * @param {Error} error - Error to present
   * @param {string} requestOrigin - Optional origin for CORS headers
   */
  presentError(res, error, requestOrigin = null) {
    const headers = {
      ...getResponseHeaders('text/html'),
      'Content-Security-Policy': getContentSecurityPolicy()
    };
    
    res.writeHead(500, headers);
    res.end(this.formatError(error));
  }
}