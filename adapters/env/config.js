import { ConfigAdapterPort } from '../../ports/interfaces/ports.js';

export class ConfigAdapter extends ConfigAdapterPort {
  constructor() {
    super();
    this.config = new Map();
  }

  get(key, defaultValue) {
    return process.env[key] ?? this.config.get(key) ?? defaultValue;
  }

  set(key, value) {
    this.config.set(key, value);
    return value;
  }
  
  getAll() {
    const config = {};
    for (const [key, value] of this.config.entries()) {
      config[key] = value;
    }
    return config;
  }
}

export const config = new ConfigAdapter(); 