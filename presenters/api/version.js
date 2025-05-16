import { BasePresenter, getResponseHeaders } from '../base.js';

export class VersionPresenter extends BasePresenter {
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
    const headers = getResponseHeaders('application/json');
    response.writeHead(200, headers);
    response.end(JSON.stringify(this.format(version)));
  }

  presentError(response, error) {
    const headers = getResponseHeaders('application/json');
    response.writeHead(500, headers);
    response.end(JSON.stringify(this.formatError(error)));
  }
}

export const presenter = new VersionPresenter(); 