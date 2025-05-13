import { readFileSync } from 'node:fs';
import { ConfigPort } from '../ports/interfaces.js';

export class ConfigAdapter extends ConfigPort {
  constructor() {
    super();
    this.store = {};
    this.load();
  }

  load() {
    try {
      const text = readFileSync('.env', 'utf8');
      text.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            this.set(key.trim(), value.trim());
          }
        }
      });
    } catch (error) {
      // File not found is ok
    }
  }

  get(key) {
    return this.store[key] ?? process.env[key];
  }

  set(key, value) {
    if (value === undefined) {
      delete this.store[key];
    } else {
      this.store[key] = value;
    }
  }
}

export const config = new ConfigAdapter(); 