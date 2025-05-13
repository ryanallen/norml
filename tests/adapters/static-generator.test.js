import { strict as assert } from 'assert';
import { test } from 'node:test';
import { StaticGeneratorAdapter } from '../../adapters/static-generator.js';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';

test('StaticGeneratorAdapter', async (t) => {
  const testDir = join(process.cwd(), 'test-output');
  const testFile = join(testDir, 'test.html');

  // Setup and cleanup
  t.beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });
  
  t.afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  await t.test('writes output to file', async () => {
    const generator = new StaticGeneratorAdapter();
    const testContent = '<html><body>Test</body></html>';
    
    await generator.writeOutput(testContent, testFile);
    
    const content = await readFile(testFile, 'utf8');
    assert.equal(content, testContent);
  });
}); 