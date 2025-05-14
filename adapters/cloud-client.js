import { CloudPort } from '../ports/interfaces.js';
import { request } from 'node:https';

export class CloudAdapter extends CloudPort {
  constructor() {
    super();
    this.config = null;
    this.authToken = null;
    this.tokenExpiry = null;
  }

  async initialize(config) {
    if (!config?.credentials) {
      throw new Error('Cloud credentials are required');
    }
    this.config = config;
    await this.refreshAuthToken();
    return true;
  }

  async callApi(service, method, params = {}) {
    if (!this.config) {
      throw new Error('Cloud adapter not initialized');
    }

    await this.ensureValidToken();

    return new Promise((resolve, reject) => {
      const options = {
        hostname: service,
        path: method,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      };

      const req = request(options, (res) => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString();
          try {
            const response = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject(this.handleError(response));
            }
          } catch (error) {
            reject(this.handleError(error));
          }
        });
      });

      req.on('error', error => reject(this.handleError(error)));
      req.write(JSON.stringify(params));
      req.end();
    });
  }

  async getAuthToken() {
    if (!this.authToken || this.isTokenExpired()) {
      await this.refreshAuthToken();
    }
    return this.authToken;
  }

  async handleError(error) {
    const formattedError = {
      message: error.message || 'Unknown API error',
      code: error.code || 'UNKNOWN',
      status: error.status || 500,
      details: error.details || null
    };

    console.error('[Cloud Client] API Error:', formattedError);
    return formattedError;
  }

  // Protected methods for subclasses to implement
  async refreshAuthToken() {
    throw new Error('refreshAuthToken() must be implemented by subclass');
  }

  isTokenExpired() {
    if (!this.tokenExpiry) return true;
    // Consider token expired 5 minutes before actual expiry
    return (Math.floor(Date.now() / 1000) + 300) >= this.tokenExpiry;
  }
} 