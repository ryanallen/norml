import { Presenter } from '../ports/interfaces.js';

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
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(this.format(version)));
  }

  presentError(response, error) {
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(this.formatError(error)));
  }
}

export const presenter = new VersionPresenter(); 