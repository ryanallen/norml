import { Presenter } from '../../ports/interfaces/ports.js';
import { ResponseHeaders } from '../../ports/core/headers.js';

export class IndexPresenter extends Presenter {
  format(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <title>${content.title}</title>
  <script src="/presenters/static/assets/js/status-checker.js"></script>
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
    // Pre-define features in a global variable for the status checker
    window.appFeatures = ${JSON.stringify(content.features.map(feature => ({
      id: feature.id,
      name: feature.name,
      endpoint: feature.endpoint,
      states: feature.states
    })))};
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