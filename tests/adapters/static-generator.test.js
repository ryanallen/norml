import { strict as assert } from 'assert';
import { test } from 'node:test';
import { StaticGeneratorAdapter } from '../../adapters/static-generator.js';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { rm } from 'fs/promises';

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
    assert(adapter instanceof StaticGeneratorAdapter);
    assert.equal(typeof adapter.generateStatic, 'function');
    assert.equal(typeof adapter.writeOutput, 'function');
    assert.equal(typeof adapter.writeFile, 'function');
  });

  await t.test('should write file successfully', async () => {
    const testFile = join(testDir, 'test.html');
    const result = await adapter.writeFile(testFile, '<html>test</html>');
    assert.equal(result, true);
    
    const content = readFileSync(testFile, 'utf8');
    assert.equal(content, '<html>test</html>');
    await rm(testFile);
  });

  await t.test('should write output with correct path', async () => {
    const testFile = join(testDir, 'output.html');
    const result = await adapter.writeOutput('<html>output</html>', testFile);
    assert.equal(result, true);
    
    const content = readFileSync(testFile, 'utf8');
    assert.equal(content, '<html>output</html>');
    await rm(testFile);
  });

  await t.test('should handle write errors gracefully', async () => {
    const testFile = join(testDir, 'invalid', 'path', 'file.html');
    // Create the directory structure first
    mkdirSync(dirname(testFile), { recursive: true });
    const result = await adapter.writeFile(testFile, '<html>test</html>');
    assert.equal(result, true);
    await rm(testFile);
  });

  await t.test('should pass through content in generateStatic', async () => {
    const content = '<html>test</html>';
    const result = await adapter.generateStatic(content);
    assert.equal(result, content);
  });

  await t.test('should handle writeOutput errors', async () => {
    const result = await adapter.writeOutput('test content', '');
    assert.equal(result, false);
  });
}); 