import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Secrets adapter for loading configuration from secure sources
 * Follows RHOMBUS architecture
 */
export class SecretsAdapter {
  constructor() {
    this.secretsPath = 'adapters/env/secrets.json';
    this.secrets = {};
    this.loaded = false;
  }
  
  /**
   * Load secrets from secure file
   */
  loadAll() {
    console.log('[Secrets Adapter] Loading secrets from secure file');
    
    try {
      const filePath = path.resolve(process.cwd(), this.secretsPath);
      
      if (existsSync(filePath)) {
        const fileContent = readFileSync(filePath, 'utf8');
        this.secrets = JSON.parse(fileContent);
        
        // Apply secrets to process.env for compatibility
        Object.entries(this.secrets).forEach(([key, value]) => {
          process.env[key] = value;
        });
        
        this.loaded = true;
        console.log('[Secrets Adapter] Successfully loaded configuration');
        
        // Special handling for essential variables
        if (this.has('MONGODB_URI')) {
          console.log('[Secrets Adapter] Found MongoDB URI in configuration');
        }
        
        return true;
      } else {
        console.warn(`[Secrets Adapter] No secrets file found at ${this.secretsPath}`);
        console.log('[Secrets Adapter] Using environment variables as fallback');
        this.loaded = false;
        return false;
      }
    } catch (error) {
      console.error(`[Secrets Adapter] Error loading secrets: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get a configuration value
   */
  get(key, defaultValue = null) {
    return this.secrets[key] || process.env[key] || defaultValue;
  }
  
  /**
   * Check if a configuration key exists
   */
  has(key) {
    return key in this.secrets || key in process.env;
  }
}

// Create and export a singleton instance
export const secrets = new SecretsAdapter(); 