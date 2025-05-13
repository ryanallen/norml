import { Presenter } from '../ports/interfaces.js';

export class IndexPresenter extends Presenter {
  format(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 2em auto; padding: 0 1em; }
    .status { padding: 1em; border-radius: 4px; margin: 1em 0; }
    .loading { background: #f5f5f5; }
    .error { background: #fee; }
    .success { background: #efe; }
  </style>
</head>
<body>
  <h1>${content.title}</h1>
  ${content.features.map(feature => `
    <div class="feature">
      <h2>${feature.name}</h2>
      <div id="${feature.id}" class="status loading">
        ${feature.states.checking.message}
      </div>
    </div>
  `).join('')}

  <script>
    async function checkStatus(feature) {
      const element = document.getElementById(feature.id);
      
      function updateElement(state, content) {
        element.className = 'status ' + state;
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
  <title>Error</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 2em auto; padding: 0 1em; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>Error</h1>
  <p class="error">${error.message}</p>
</body>
</html>`;
  }

  present(res, content) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(this.format(content));
  }

  presentError(res, error) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(this.formatError(error));
  }
}

export const presenter = new IndexPresenter(); 