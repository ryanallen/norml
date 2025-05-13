// Version information logic
import { config } from '../adapters/config.js';

export async function getVersion() {
  return config.get('VERSION') || '0.1.0';
}

export function validateVersion(version) {
  if (!version) throw new Error('Version is required');
  return version;
}

export async function getBuildInfo() {
  return {
    version: await getVersion(),
    node: process.version,
    timestamp: new Date().toISOString(),
    environment: config.get('NODE_ENV') || 'development'
  };
} 