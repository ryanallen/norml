import { CloudAdapter } from './cloud-client.js';
import { request } from 'node:https';

export class GcpAdapter extends CloudAdapter {
  async initialize(config) {
    if (!config?.projectId) {
      throw new Error('Google Cloud project ID is required');
    }
    return super.initialize(config);
  }

  async callApi(service, method, params = {}) {
    // Transform generic service/method into GCP-specific format
    const hostname = `${service}.googleapis.com`;
    const path = `/v1/${method}`;
    return super.callApi(hostname, path, params);
  }

  async refreshAuthToken() {
    if (!this.config?.credentials?.client_email || !this.config?.credentials?.private_key) {
      throw new Error('Invalid GCP credentials format');
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

    // Sign JWT using Node.js crypto module with proper key format
    const crypto = await import('node:crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signInput);
    
    // Convert PEM key to proper format if needed
    let privateKey = this.config.credentials.private_key;
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }
    
    const signature = sign.sign(privateKey, 'base64url');
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

  async handleError(error) {
    const formattedError = await super.handleError(error);
    formattedError.message = formattedError.message || 'Unknown Google Cloud API error';
    return formattedError;
  }
}

// Export singleton instance
export const gcp = new GcpAdapter(); 