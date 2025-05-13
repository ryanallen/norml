import { Presenter } from '../ports/interfaces.js';

export class DbStatusPresenter extends Presenter {
  format(status) {
    console.log('[DB Presenter] Formatting status:', status);
    return {
      status: status.connected ? 'available' : 'unavailable',
      time: status.timestamp
    };
  }

  formatError(error) {
    console.log('[DB Presenter] Formatting error:', error);
    return {
      status: 'error',
      message: error.message
    };
  }

  present(res, status) {
    console.log('[DB Presenter] Presenting status');
    const code = status.connected ? 200 : 503;
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(this.format(status)));
  }

  presentError(res, error) {
    console.log('[DB Presenter] Presenting error');
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(this.formatError(error)));
  }
}

export const presenter = new DbStatusPresenter(); 