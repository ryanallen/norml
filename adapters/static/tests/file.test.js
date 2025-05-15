import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';
import { StaticFileAdapter } from '../file.js';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Static File Adapter', () => {
  const testDir = join(process.cwd(), 'test-files');
  const testFilePath = join(testDir, 'test.txt');
  const testFileContent = 'Test file content';
  
  let adapter;
  
  beforeEach(async () => {
    // Create test directory and file
    try {
      if (!existsSync(testDir)) {
        await mkdir(testDir, { recursive: true });
      }
      await writeFile(testFilePath, testFileContent);
    } catch (err) {
      console.error('Setup error:', err);
    }
    
    // Create a fresh adapter for each test
    adapter = new StaticFileAdapter();
  });
  
  // Note: We removed the after() cleanup since it causes issues with Windows
  // The test-files directory will be cleaned up by the global cleanup script
  
  describe('readFile', () => {
    it('should read file content correctly', async () => {
      const content = await adapter.readFile(testFilePath);
      assert.strictEqual(content.toString(), testFileContent);
    });
    
    it('should throw error for non-existent files', async () => {
      try {
        await adapter.readFile(join(testDir, 'nonexistent.txt'));
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message.includes('Failed to read file'));
      }
    });
  });
  
  describe('fileExists', () => {
    it('should return true for existing files', async () => {
      const exists = await adapter.fileExists(testFilePath);
      assert.strictEqual(exists, true);
    });
    
    it('should return false for non-existent files', async () => {
      const exists = await adapter.fileExists(join(testDir, 'nonexistent.txt'));
      assert.strictEqual(exists, false);
    });
  });
  
  describe('getMimeType', () => {
    it('should return correct MIME type for known extensions', () => {
      assert.strictEqual(adapter.getMimeType('test.html'), 'text/html');
      assert.strictEqual(adapter.getMimeType('test.css'), 'text/css');
      assert.strictEqual(adapter.getMimeType('test.js'), 'text/javascript');
      assert.strictEqual(adapter.getMimeType('test.json'), 'application/json');
      assert.strictEqual(adapter.getMimeType('test.png'), 'image/png');
      assert.strictEqual(adapter.getMimeType('test.jpg'), 'image/jpeg');
      assert.strictEqual(adapter.getMimeType('test.ico'), 'image/x-icon');
    });
    
    it('should return application/octet-stream for unknown extensions', () => {
      assert.strictEqual(adapter.getMimeType('test.xyz'), 'application/octet-stream');
      assert.strictEqual(adapter.getMimeType('test'), 'application/octet-stream');
    });
  });
}); 