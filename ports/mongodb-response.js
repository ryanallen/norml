// MongoDB response handling port
import { MongoDBEventPort } from './interfaces.js';

export class MongoDBResponsePort {
  constructor(eventHandler) {
    if (!(eventHandler instanceof MongoDBEventPort)) {
      throw new Error('Invalid event handler: must implement MongoDBEventPort');
    }
    this.eventHandler = eventHandler;
  }

  async handleSuccess(res, data) {
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data
    };

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(response));
  }

  async handleError(res, error) {
    const response = {
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        details: error.details || null
      }
    };

    this.eventHandler.onError(error);

    res.writeHead(error.status || 500, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(response));
  }

  async handleStream(res, stream) {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked'
    });

    stream.on('data', chunk => {
      res.write(JSON.stringify(chunk) + '\n');
    });

    stream.on('end', () => {
      res.end();
    });

    stream.on('error', error => {
      this.handleError(res, error);
    });
  }
} 