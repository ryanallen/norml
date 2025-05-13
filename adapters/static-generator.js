import { StaticGeneratorPort } from '../ports/interfaces.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export class StaticGeneratorAdapter extends StaticGeneratorPort {
  async writeOutput(html, path) {
    const outputPath = join(process.cwd(), path);
    await writeFile(outputPath, html, 'utf8');
    return true;
  }
} 