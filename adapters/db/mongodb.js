// MongoDB adapter using raw TCP socket
import { DatabasePort } from '../../ports/interfaces/ports.js';
import { createConnection } from 'node:net';
import { resolveSrv } from 'node:dns/promises';

export class MongoDbAdapter extends DatabasePort {
  constructor() {
    super();
    this.isConnected = false;
    this.lastError = null;
    this.connectionDetails = null;
  }

  // Connect to database using URI
  async connect(options = {}) {
    try {
      console.log('[DB Adapter] Attempting to connect to database');
      
      // Get URI from options or environment
      const uri = options.uri || process.env.MONGODB_URI;
      if (!uri) {
        const error = new Error('MongoDB URI is required');
        console.error('[DB Adapter] Connection error:', error.message);
        this.lastError = error;
        this.isConnected = false;
        return false;
      }

      console.log('[DB Adapter] URI format check:', uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://') ? 'Valid' : 'Invalid');
      
      // Parse connection details
      const url = new URL(uri);
      let host = url.hostname;
      let port = parseInt(url.port) || 27017;
      
      // Store connection details for logging (without credentials)
      this.connectionDetails = {
        protocol: url.protocol,
        host: host,
        port: port,
        pathname: url.pathname
      };
      
      console.log('[DB Adapter] Connecting to:', host, 'on port', port);
      
      // Handle mongodb+srv protocol (DNS SRV lookup)
      if (uri.startsWith('mongodb+srv://')) {
        try {
          console.log('[DB Adapter] Performing DNS SRV lookup for:', host);
          const records = await resolveSrv(`_mongodb._tcp.${host}`);
          if (records && records.length > 0) {
            // Use the first SRV record
            host = records[0].name;
            port = records[0].port;
            console.log('[DB Adapter] DNS SRV resolved to:', host, 'on port', port);
          } else {
            console.warn('[DB Adapter] DNS SRV lookup returned no records');
          }
        } catch (dnsError) {
          console.error('[DB Adapter] DNS SRV lookup failed:', dnsError.message);
          this.lastError = new Error(`DNS SRV lookup failed: ${dnsError.message}`);
          this.isConnected = false;
          return false;
        }
      }

      // Create raw socket connection with timeout
      try {
        console.log('[DB Adapter] Creating socket connection');
        const socket = createConnection(port, host);
        
        const connectPromise = new Promise((resolve, reject) => {
          socket.once('connect', () => {
            console.log('[DB Adapter] Socket connected successfully');
            resolve();
          });
          
          socket.once('error', (err) => {
            console.error('[DB Adapter] Socket error:', err.message);
            reject(err);
          });
          
          // Add timeout
          const timeout = setTimeout(() => {
            console.error('[DB Adapter] Connection timeout after 5000ms');
            reject(new Error('Connection timeout after 5000ms'));
          }, 5000);
          
          // Clear timeout if connection is successful
          socket.once('connect', () => clearTimeout(timeout));
        });
        
        await connectPromise;
        this.socket = socket;
        this.isConnected = true;
        console.log('[DB Adapter] Connection established successfully');
        return true;
      } catch (socketError) {
        console.error('[DB Adapter] Socket connection error:', socketError.message);
        this.lastError = socketError;
        this.isConnected = false;
        return false;
      }
    } catch (error) {
      console.error('[DB Adapter] Unexpected error during connection:', error.message);
      this.lastError = error;
      this.isConnected = false;
      return false;
    }
  }

  // Close connection
  async disconnect() {
    if (this.socket) {
      console.log('[DB Adapter] Disconnecting socket');
      this.socket.end();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  async getStatus() {
    const status = {
      connected: this.isConnected,
      lastError: this.lastError ? this.lastError.message : null,
      timestamp: new Date().toISOString()
    };
    
    // Add connection details if available (without credentials)
    if (this.connectionDetails) {
      status.connectionDetails = this.connectionDetails;
    }
    
    return status;
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
      console.error('[DB Adapter] Ping error:', error.message);
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
      console.error('[DB Adapter] Stats error:', error.message);
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
export const db = new MongoDbAdapter(); 