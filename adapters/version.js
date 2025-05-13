// Version information adapter
// This adapter provides access to our single source of truth for version info
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function getPackageVersion(fsModule = { readFileSync }) {
  try {
    console.log('[Version Adapter] Reading version from package.json');
    const packagePath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fsModule.readFileSync(packagePath, 'utf8'));
    const version = `${packageJson.version}-alpha.1`;
    console.log('[Version Adapter] Found version:', version);
    return version;
  } catch (error) {
    console.error('[Version Adapter] Error reading version:', error);
    throw new Error('Failed to read version information');
  }
} 