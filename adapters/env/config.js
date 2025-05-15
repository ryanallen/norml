import { ConfigPort } from '../../ports/interfaces/ports.js';

export class ConfigAdapter extends ConfigPort {
  constructor() {
    super();
    this.config = new Map();
  }

  get(key) {
    return process.env[key] ?? this.config.get(key);
  }

  set(key, value) {
    this.config.set(key, value);
    return value;
  }
}

export const config = new ConfigAdapter(); 