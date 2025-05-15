import { Presenter } from '../../ports/interfaces/ports.js';
import { ResponseHeaders } from '../../ports/core/headers.js';

export class DbPresenter extends Presenter {
  format(data) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      data
    };
  }

  formatError(error) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }

  present(res, data) {
    const headers = ResponseHeaders.getHeadersFor('application/json');
    
    // Ensure X-Content-Type-Options is set
    if (!headers['X-Content-Type-Options']) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }
    
    res.writeHead(200, headers);
    res.end(JSON.stringify(this.format(data)));
  }

  presentError(res, error) {
    const headers = ResponseHeaders.getHeadersFor('application/json');
    
    // Ensure X-Content-Type-Options is set
    if (!headers['X-Content-Type-Options']) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }
    
    res.writeHead(500, headers);
    res.end(JSON.stringify(this.formatError(error)));
  }
}

export const presenter = new DbPresenter(); 