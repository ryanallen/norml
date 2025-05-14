import { GoogleCloudPort } from '../ports/interfaces.js';
import { createServer } from 'node:http';
import { request } from 'node:https';

export class GoogleCloudAdapter extends GoogleCloudPort {
  constructor() {
    super();
    this.config = null;
    this.authToken = null;
    this.tokenExpiry = null;
  }

  async initialize(config) {
    if (!config?.projectId) {
      throw new Error('Google Cloud project ID is required');
    }
    if (!config?.credentials) {
      throw new Error('Google Cloud credentials are required');
    }
    this.config = config;
    await this.refreshAuthToken();
    return true;
  }

  async callApi(service, method, params = {}) {
    if (!this.config) {
      throw new Error('Google Cloud adapter not initialized');
    }

    await this.ensureValidToken();

    return new Promise((resolve, reject) => {
      const options = {
        hostname: `${service}.googleapis.com`,
        path: `/v1/${method}`,
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
      message: error.message || 'Unknown Google Cloud API error',
      code: error.code || 'UNKNOWN',
      status: error.status || 500,
      details: error.details || null
    };

    console.error('[Google Cloud Adapter] API Error:', formattedError);
    return formattedError;
  }

  // Private methods
  async ensureValidToken() {
    if (!this.authToken || this.isTokenExpired()) {
      await this.refreshAuthToken();
    }
  }

  async refreshAuthToken() {
    if (!this.config?.credentials?.client_email || !this.config?.credentials?.private_key) {
      throw new Error('Invalid credentials format');
    }

    const now = Math.floor(Date.now() / 1000);
    const tokenExpiry = now + 3600; // 1 hour from now

    const jwtHeader = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const jwtClaim = {
      iss: this.config.credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: tokenExpiry,
      iat: now
    };

    const base64Header = Buffer.from(JSON.stringify(jwtHeader)).toString('base64url');
    const base64Claim = Buffer.from(JSON.stringify(jwtClaim)).toString('base64url');
    const signInput = `${base64Header}.${base64Claim}`;

    // Sign JWT using Node.js crypto module
    const crypto = await import('node:crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signInput);
    const signature = sign.sign(this.config.credentials.private_key, 'base64url');

    const jwt = `${signInput}.${signature}`;

    // Exchange JWT for access token
    const tokenResponse = await this.callTokenApi(jwt);
    this.authToken = tokenResponse.access_token;
    this.tokenExpiry = now + tokenResponse.expires_in;
  }

  async callTokenApi(jwt) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      const req = request(options, (res) => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString();
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      const data = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      }).toString();
      req.write(data);
      req.end();
    });
  }

  isTokenExpired() {
    if (!this.tokenExpiry) return true;
    // Consider token expired 5 minutes before actual expiry
    return (Math.floor(Date.now() / 1000) + 300) >= this.tokenExpiry;
  }
}

// Export singleton instance
export const googleCloud = new GoogleCloudAdapter(); 