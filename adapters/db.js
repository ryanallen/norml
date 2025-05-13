// Simple database connection adapter
export class SimpleDbClient {
  constructor(uri) {
    if (!uri) {
      throw new Error('DB_URI environment variable is required');
    }
    this.uri = uri;
    this.isConnected = false;
  }

  async connect() {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));
    this.isConnected = true;
    return this;
  }

  db() {
    return {
      command: async (cmd) => {
        if (!this.isConnected) {
          throw new Error('Not connected to database');
        }
        if (cmd.status === 1) {
          return { ok: 1 };
        }
        throw new Error('Unknown command');
      }
    };
  }

  async close() {
    this.isConnected = false;
  }
}

// Connect to database and return the connection
export default () => new SimpleDbClient(process.env.DB_URI).connect(); 