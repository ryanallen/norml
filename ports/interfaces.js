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

export class MongoDBPort {
  async connect(options) {
    throw new Error('Method not implemented');
  }

  async disconnect() {
    throw new Error('Method not implemented');
  }

  async getStatus() {
    throw new Error('Method not implemented');
  }
}

export class MongoDBValidationPort {
  validateConnection(options) {
    throw new Error('Method not implemented');
  }

  validateQuery(query) {
    throw new Error('Method not implemented');
  }

  validateResult(result) {
    throw new Error('Method not implemented');
  }
}

export class MongoDBEventPort {
  onConnect(handler) {
    throw new Error('Method not implemented');
  }

  onDisconnect(handler) {
    throw new Error('Method not implemented');
  }

  onError(handler) {
    throw new Error('Method not implemented');
  }
}

export class MongoDBHealthPort {
  async checkHealth() {
    throw new Error('Method not implemented');
  }

  async getMetrics() {
    throw new Error('Method not implemented');
  }

  async getLogs() {
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

  async writeFile(filename, content) {
    throw new Error('StaticGeneratorPort.writeFile() must be implemented');
  }
}

export class GoogleCloudPort {
  async initialize(config) {
    throw new Error('Method not implemented');
  }

  async callApi(service, method, params) {
    throw new Error('Method not implemented');
  }

  async getAuthToken() {
    throw new Error('Method not implemented');
  }

  async handleError(error) {
    throw new Error('Method not implemented');
  }
}

export class MonitoringPort {
  recordMetric(name, value, tags = {}) {
    throw new Error('Method not implemented');
  }

  getMetrics() {
    throw new Error('Method not implemented');
  }

  startTimer(name) {
    throw new Error('Method not implemented');
  }

  recordHistogram(name, value, tags = {}) {
    throw new Error('Method not implemented');
  }

  setGauge(name, value, tags = {}) {
    throw new Error('Method not implemented');
  }
} 