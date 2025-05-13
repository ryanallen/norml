import { StaticGeneratorPort } from '../ports/interfaces.js';
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';

export class StaticGeneratorAdapter extends StaticGeneratorPort {
  async generateStatic(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content: must be a non-empty string');
    }
    return content;
  }

  async writeOutput(html, path) {
    if (!path || typeof path !== 'string') {
      throw new Error('Invalid path: must be a non-empty string');
    }
    if (!html || typeof html !== 'string') {
      throw new Error('Invalid HTML: must be a non-empty string');
    }
    return this.writeFile(path, html);
  }

  async writeFile(filename, content) {
    if (!filename || typeof filename !== 'string') {
      throw new Error('Invalid filename: must be a non-empty string');
    }
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content: must be a non-empty string');
    }

    try {
      // Ensure directory exists
      const dir = dirname(filename);
      await mkdir(dir, { recursive: true });
      
      // Write file
      await writeFile(filename, content, 'utf8');
      return true;
    } catch (error) {
      const message = error.message || 'Unknown error';
      throw new Error(`Failed to write file ${filename}: ${message}`);
    }
  }
} 