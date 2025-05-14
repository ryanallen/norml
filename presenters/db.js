import { Presenter } from '../ports/interfaces.js';
import { ResponseHeaders } from '../ports/headers.js';

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
    res.writeHead(200, ResponseHeaders.getDefaultHeaders());
    res.end(JSON.stringify(this.format(data)));
  }

  presentError(res, error) {
    res.writeHead(500, ResponseHeaders.getDefaultHeaders());
    res.end(JSON.stringify(this.formatError(error)));
  }
}

export const presenter = new DbPresenter(); 