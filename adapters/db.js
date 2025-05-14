// Simple DB adapter using raw TCP socket
import { DbPort } from '../ports/interfaces.js';
import { createConnection } from 'node:net';
import { resolveSrv } from 'node:dns/promises';

export class DbAdapter extends DbPort {
  constructor() {
    super();
    this.isConnected = false;
    this.lastError = null;
  }

  // Connect to database using URI
  async connect(options = {}) {
    try {
      // Get URI from options or environment
      const uri = options.uri || process.env.MONGODB_URI;
      if (!uri) throw new Error('MongoDB URI is required');

      // Parse connection details
      const url = new URL(uri);
      let host = url.hostname;
      let port = parseInt(url.port) || 27017;
      
      // Handle mongodb+srv protocol (DNS SRV lookup)
      if (uri.startsWith('mongodb+srv://')) {
        try {
          const records = await resolveSrv(`_mongodb._tcp.${host}`);
          if (records && records.length > 0) {
            // Use the first SRV record
            host = records[0].name;
            port = records[0].port;
          }
        } catch (dnsError) {
          throw new Error(`DNS SRV lookup failed: ${dnsError.message}`);
        }
      }

      // Create raw socket connection
      const socket = createConnection(port, host);
      await new Promise((resolve, reject) => {
        socket.once('connect', resolve);
        socket.once('error', reject);
      });
      
      this.socket = socket;
      this.isConnected = true;
      return true;
    } catch (error) {
      this.lastError = error;
      this.isConnected = false;
      throw error;
    }
  }

  // Close connection
  async disconnect() {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  async getStatus() {
    return {
      connected: this.isConnected,
      lastError: this.lastError ? this.lastError.message : null,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const db = new DbAdapter(); 