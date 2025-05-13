import { DatabasePort } from '../../ports/interfaces.js';

export class MockDatabaseAdapter extends DatabasePort {
  constructor(options = {}) {
    super();
    this.shouldSucceed = options.shouldSucceed ?? true;
    this.error = options.error;
    this.isConnected = false;
    this.connectCalled = false;
    this.checkStatusCalled = false;
    this.disconnectCalled = false;
  }

  async connect() {
    this.connectCalled = true;
    if (!this.shouldSucceed) {
      this.isConnected = false;
      throw this.error || new Error('Mock connection failed');
    }
    this.isConnected = true;
    return true;
  }

  async checkStatus() {
    this.checkStatusCalled = true;
    if (!this.shouldSucceed) {
      return {
        connected: false,
        lastError: this.error || new Error('Mock status check failed'),
        timestamp: new Date().toISOString()
      };
    }
    return {
      connected: this.isConnected,
      lastError: null,
      timestamp: new Date().toISOString()
    };
  }

  async disconnect() {
    this.disconnectCalled = true;
    this.isConnected = false;
  }
} 