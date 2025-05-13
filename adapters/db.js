import { DatabasePort } from '../ports/interfaces.js';

export class DatabaseAdapter extends DatabasePort {
  constructor() {
    super();
    this.isConnected = false;
    this.lastError = null;
  }

  async connect() {
    try {
      // Simulate database connection
      await new Promise(resolve => setTimeout(resolve, 500));
      this.isConnected = true;
      this.lastError = null;
      return true;
    } catch (error) {
      this.isConnected = false;
      this.lastError = error;
      throw error;
    }
  }

  async checkStatus() {
    return {
      connected: this.isConnected,
      lastError: this.lastError,
      timestamp: new Date().toISOString()
    };
  }

  async disconnect() {
    this.isConnected = false;
    this.lastError = null;
  }
}

// Export a singleton instance
export const db = new DatabaseAdapter(); 