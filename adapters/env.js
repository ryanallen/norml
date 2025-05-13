import { readFileSync } from 'node:fs';

export function loadEnv() {
  const text = readFileSync('.env', 'utf8');
  text.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
} 