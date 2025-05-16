import { BasePresenter, getResponseHeaders } from '../base.js';

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

  <script>
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
   */
  present(res, data) {
    res.writeHead(200, getResponseHeaders('text/html'));
    res.end(this.format(data));
  }
  
  /**
   * Present error to the response
   * @param {Object} res - HTTP response object
   * @param {Error} error - Error to present
   */
  presentError(res, error) {
    res.writeHead(500, getResponseHeaders('text/html'));
    res.end(this.formatError(error));
  }
} 