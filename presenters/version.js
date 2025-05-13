import { Presenter } from '../ports/interfaces.js';

export class VersionPresenter extends Presenter {
  format(version) {
    return {
      status: 'available',
      version: version,
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

  present(res, version) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(this.format(version)));
  }

  presentError(res, error) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(this.formatError(error)));
  }
}

export const presenter = new VersionPresenter(); 