import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Loads environment variables from a YAML file
 * Specifically designed for Google Cloud's .env.yaml format
 * @param {string} filePath - Path to the YAML file
 */
export function loadYamlEnv(filePath = '.env.yaml') {
  try {
    // Check if file exists
    if (!existsSync(filePath)) {
      console.log(`[Env Adapter] YAML file not found: ${filePath}`);
      return false;
    }
    
    const fileContent = readFileSync(filePath, 'utf8');
    
    // GCP format has ENV_VAR: "value" format
    const lines = fileContent.split('\n');
    
    // Process each line
    for (const line of lines) {
      // Skip empty lines and comments
      if (!line || line.trim().startsWith('#')) continue;
      
      // Match key-value pairs in YAML format
      // This handles 'KEY: "value"' and 'KEY: value' formats
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*(?:"([^"]*)"|(.*))$/);
      
      if (match) {
        const key = match[1].trim();
        // Use quoted value if present, otherwise use unquoted value
        const value = (match[2] !== undefined) ? match[2] : match[3]?.trim();
        
        if (key && value !== undefined) {
          process.env[key] = value;
          console.log(`[Env Adapter] Loaded ${key} from YAML`);
        }
      }
    }
    
    console.log(`[Env Adapter] Successfully loaded YAML environment from ${filePath}`);
    return true;
  } catch (error) {
    console.error(`[Env Adapter] Error loading YAML environment: ${error.message}`);
    return false;
  }
} 