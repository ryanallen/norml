import { Presenter } from '../ports/interfaces.js';
import { ResponseHeaders } from '../ports/headers.js';

export class IndexPresenter extends Presenter {
  format(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
  <title>${content.title}</title>
</head>
<body>
  <div>
    <h1>${content.title}</h1>
    <p>${content.description}</p>
    <a href="${content.repoUrl}" target="_blank">View on GitHub</a>
  </div>
  ${content.features.map(feature => `
    <div>
      <h2>${feature.name}</h2>
      <div id="${feature.id}">
        ${feature.states.checking.message}
      </div>
    </div>
  `).join('')}

  <script>
    async function checkStatus(feature) {
      const element = document.getElementById(feature.id);
      
      function updateElement(state, content) {
        element.textContent = typeof content === 'object' ? 
          JSON.stringify(content, null, 2) : content;
      }

      try {
        const response = await fetch(feature.endpoint);
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        const data = await response.json();
        
        // Handle different endpoint formats
        if (feature.endpoint === '/api/version') {
          updateElement('success', data);
        } else if (feature.endpoint === '/db') {
          if (data.status === 'available') {
            updateElement('success', data);
          } else if (data.status === 'error') {
            updateElement('error', data);
          } else {
            updateElement('error', { error: 'Unexpected status: ' + data.status });
          }
        }
      } catch (error) {
        console.error('API call failed:', error);
        updateElement('error', { 
          error: error.message || 'Failed to fetch status'
        });
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      ${content.features.map(feature => `
        checkStatus(${JSON.stringify(feature)});
      `).join('')}
    });
  </script>
</body>
</html>`;
  }

  formatError(error) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
  <title>Error</title>
</head>
<body>
  <h1>Error</h1>
  <p>${error.message}</p>
</body>
</html>`;
  }

  present(res, content) {
    res.writeHead(200, ResponseHeaders.getHeadersFor('text/html'));
    res.end(this.format(content));
  }

  presentError(res, error) {
    res.writeHead(500, ResponseHeaders.getHeadersFor('text/html'));
    res.end(this.formatError(error));
  }
}

export const presenter = new IndexPresenter(); 