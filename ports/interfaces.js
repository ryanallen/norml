// Define the interfaces that adapters must implement
export class DatabasePort {
  async connect() {
    throw new Error('Method not implemented');
  }
  
  async checkStatus() {
    throw new Error('Method not implemented');
  }
  
  async disconnect() {
    throw new Error('Method not implemented');
  }
}

export class VersionPort {
  async getVersion() {
    throw new Error('VersionPort.getVersion() must be implemented');
  }
  
  async getBuildInfo() {
    throw new Error('Method not implemented');
  }
}

// Interface for presenters
export class Presenter {
  format(data) {
    throw new Error('Method not implemented');
  }
  
  formatError(error) {
    throw new Error('Method not implemented');
  }
}

export class ConfigPort {
  get(key) {
    throw new Error('Method not implemented');
  }
  
  set(key, value) {
    throw new Error('Method not implemented');
  }
}

export class StaticGeneratorPort {
  async generateStatic(content) {
    throw new Error('Method not implemented');
  }
  
  async writeOutput(html) {
    throw new Error('Method not implemented');
  }
} 