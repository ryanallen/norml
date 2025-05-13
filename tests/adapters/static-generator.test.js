import { strict as assert } from 'assert';
import { test } from 'node:test';
import { StaticGeneratorAdapter } from '../../adapters/static-generator.js';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';

const adapter = new StaticGeneratorAdapter();
const testDir = join(process.cwd(), 'test-output');

test('StaticGeneratorAdapter', async (t) => {
  // Setup test directory
  t.beforeEach(() => {
    try {
      mkdirSync(testDir, { recursive: true });
    } catch (error) {
      // Directory may already exist
    }
  });

  // Cleanup after tests
  t.afterEach(() => {
    try {
      rmSync(testDir, { recursive: true });
    } catch (error) {
      // Directory may not exist
    }
  });

  await t.test('should implement StaticGeneratorPort interface', () => {
    assert(adapter.writeFile);
    assert(adapter.writeOutput);
    assert(adapter.generateStatic);
  });

  await t.test('should write file successfully', async () => {
    const testFile = join(testDir, 'test.html');
    const testContent = '<html>Test content</html>';
    
    const result = await adapter.writeFile(testFile, testContent);
    assert.equal(result, true);
    
    const written = readFileSync(testFile, 'utf8');
    assert.equal(written, testContent);
  });

  await t.test('should write output with correct path', async () => {
    const testFile = join(testDir, 'output.html');
    const testContent = '<html>Output test</html>';
    
    const result = await adapter.writeOutput(testContent, testFile);
    assert.equal(result, true);
    
    const written = readFileSync(testFile, 'utf8');
    assert.equal(written, testContent);
  });

  await t.test('should handle write errors gracefully', async () => {
    // Try to write to an invalid path
    const result = await adapter.writeFile(join('invalid', 'path', 'file.html'), 'test');
    assert.equal(result, false);
  });
}); 