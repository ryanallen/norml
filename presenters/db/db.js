import { BasePresenter, getResponseHeaders } from '../base.js';

export class DbPresenter extends BasePresenter {
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
    const headers = getResponseHeaders('application/json');
    res.writeHead(200, headers);
    res.end(JSON.stringify(this.format(data)));
  }

  presentError(res, error) {
    const headers = getResponseHeaders('application/json');
    res.writeHead(500, headers);
    res.end(JSON.stringify(this.formatError(error)));
  }
}

export const presenter = new DbPresenter(); 