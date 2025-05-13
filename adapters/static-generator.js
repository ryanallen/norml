import { StaticGeneratorPort } from '../ports/interfaces.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

export class StaticGeneratorAdapter extends StaticGeneratorPort {
  async writeOutput(html, path) {
    const outputPath = join(process.cwd(), path);
    await this.writeFile(outputPath, html);
    return true;
  }

  async writeFile(filename, content) {
    try {
      writeFileSync(join(process.cwd(), filename), content);
      return true;
    } catch (error) {
      console.error('Failed to write file:', error);
      return false;
    }
  }
} 