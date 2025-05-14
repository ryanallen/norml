// MongoDB adapter implementation
import { MongoDBPort } from '../ports/interfaces.js';
import { createConnection } from 'node:net';
import { EventEmitter } from 'node:events';
import { metrics } from './metrics.js';

// MongoDB Wire Protocol constants
const OP_REPLY = 1;
const OP_MSG = 1000;
const OP_UPDATE = 2001;
const OP_INSERT = 2002;
const OP_QUERY = 2004;
const OP_GET_MORE = 2005;
const OP_DELETE = 2006;
const OP_KILL_CURSORS = 2007;

export class MongoDBAdapter extends MongoDBPort {
  constructor() {
    super();
    this.isConnected = false;
    this.lastError = null;
  }

  async connect(options = {}) {
    try {
      const conn = await this.createConnection({
        host: options.host || 'localhost',
        port: options.port || 27017
      });
      
      this.connection = conn;
      this.isConnected = true;
      this.lastError = null;
      return true;
    } catch (error) {
      this.isConnected = false;
      this.lastError = error;
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      this.connection.end();
      this.isConnected = false;
    }
  }

  async getStatus() {
    return {
      connected: this.isConnected,
      lastError: this.lastError ? this.lastError.message : null,
      timestamp: new Date().toISOString()
    };
  }

  createConnection(options) {
    return new Promise((resolve, reject) => {
      const conn = createConnection({
        host: options.host,
        port: options.port
      });

      conn.once('connect', () => {
        conn.removeListener('error', reject);
        resolve(conn);
      });

      conn.once('error', reject);
    });
  }
}

// Export singleton instance
export const mongodb = new MongoDBAdapter(); 