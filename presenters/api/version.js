import { Presenter } from '../../ports/interfaces/ports.js';
import { ResponseHeaders } from '../../ports/core/headers.js';

export class VersionPresenter extends Presenter {
  format(version) {
    return {
      status: 'available',
      version,
      time: new Date().toISOString()
    };
  }

  formatError(error) {
    return {
      status: 'error',
      error: error.message,
      time: new Date().toISOString()
    };
  }

  present(response, version) {
    const headers = ResponseHeaders.getHeadersFor('application/json');
    
    // Ensure X-Content-Type-Options is set
    if (!headers['X-Content-Type-Options']) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }
    
    response.writeHead(200, headers);
    response.end(JSON.stringify(this.format(version)));
  }

  presentError(response, error) {
    const headers = ResponseHeaders.getHeadersFor('application/json');
    
    // Ensure X-Content-Type-Options is set
    if (!headers['X-Content-Type-Options']) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }
    
    response.writeHead(500, headers);
    response.end(JSON.stringify(this.formatError(error)));
  }
}

export const presenter = new VersionPresenter(); 