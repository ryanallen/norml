// File serving adapter
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve paths relative to project root
export function resolveProjectPath(relativePath) {
  return path.join(__dirname, '..', relativePath);
} 