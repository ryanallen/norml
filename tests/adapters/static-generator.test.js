import { strict as assert } from 'assert';
import { test } from 'node:test';
import { StaticGeneratorAdapter } from '../../adapters/static-generator.js';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { rm } from 'fs/promises';

const adapter = new StaticGeneratorAdapter();
const baseTestDir = join(process.cwd(), 'test-output');

test('StaticGeneratorAdapter', async (t) => {
  let testDir;
  let testCount = 0;

  // Setup test directory before each test
  t.beforeEach(async () => {
    testCount++;
    testDir = join(baseTestDir, `test-${testCount}`);
    try {
      await rm(testDir, { recursive: true, force: true }).catch(() => {});
      mkdirSync(testDir, { recursive: true });
    } catch (error) {
      console.error('Setup failed:', error);
    }
  });

  // Cleanup after all tests
  t.after(async () => {
    try {
      await rm(baseTestDir, { recursive: true, force: true }).catch(() => {});
    } catch (error) {
      console.error('Final cleanup failed:', error);
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
  });

  await t.test('should write output with correct path', async () => {
    const testFile = join(testDir, 'output.html');
    const result = await adapter.writeOutput('<html>output</html>', testFile);
    assert.equal(result, true);
    
    const content = readFileSync(testFile, 'utf8');
    assert.equal(content, '<html>output</html>');
  });

  await t.test('should handle write errors gracefully', async () => {
    const testFile = join(testDir, 'invalid', 'path', 'file.html');
    const result = await adapter.writeFile(testFile, '<html>test</html>');
    assert.equal(result, true);
  });

  await t.test('should pass through content in generateStatic', async () => {
    const content = '<html>test</html>';
    const result = await adapter.generateStatic(content);
    assert.equal(result, content);
  });

  await t.test('should handle writeOutput errors', async () => {
    try {
      await adapter.writeOutput('test content', null);
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert(error.message.includes('No path provided'));
    }
  });
}); 