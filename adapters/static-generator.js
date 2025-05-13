import { StaticGeneratorPort } from '../ports/interfaces.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

export class StaticGeneratorAdapter extends StaticGeneratorPort {
  async generateStatic(content) {
    return content;
  }

  async writeOutput(html, path) {
    return this.writeFile(path, html);
  }

  async writeFile(filename, content) {
    try {
      writeFileSync(filename, content);
      return true;
    } catch (error) {
      console.error('Failed to write file:', error);
      return false;
    }
  }
} 