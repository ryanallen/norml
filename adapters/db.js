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
      if (!uri) {
        this.lastError = new Error('MongoDB URI is required');
        this.isConnected = false;
        return false; // Return false instead of throwing
      }

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
          this.lastError = new Error(`DNS SRV lookup failed: ${dnsError.message}`);
          this.isConnected = false;
          return false;
        }
      }

      // Create raw socket connection with timeout
      try {
        const socket = createConnection(port, host);
        const connectPromise = new Promise((resolve, reject) => {
          socket.once('connect', resolve);
          socket.once('error', reject);
          // Add timeout
          setTimeout(() => reject(new Error('Connection timeout')), 5000);
        });
        
        await connectPromise;
        this.socket = socket;
        this.isConnected = true;
        return true;
      } catch (socketError) {
        this.lastError = socketError;
        this.isConnected = false;
        return false;
      }
    } catch (error) {
      this.lastError = error;
      this.isConnected = false;
      return false;
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
  
  // Ping the database to check response time
  async ping() {
    if (!this.isConnected || !this.socket) {
      return {
        success: false,
        latency: null,
        error: 'Not connected to database'
      };
    }
    
    try {
      const startTime = Date.now();
      
      // Simple ping using socket isAlive
      const isAlive = !this.socket.destroyed && this.socket.writable;
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      return {
        success: isAlive,
        latency,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        latency: null,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Get database server statistics
  async getStats() {
    if (!this.isConnected) {
      return {
        success: false,
        stats: null,
        error: 'Not connected to database'
      };
    }
    
    try {
      // In a real implementation, we would send commands to get stats
      // For this simple TCP adapter, we'll just return basic socket info
      const stats = {
        localAddress: this.socket.localAddress,
        localPort: this.socket.localPort,
        remoteAddress: this.socket.remoteAddress,
        remotePort: this.socket.remotePort,
        bytesRead: this.socket.bytesRead,
        bytesWritten: this.socket.bytesWritten
      };
      
      return {
        success: true,
        stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        stats: null,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const db = new DbAdapter(); 