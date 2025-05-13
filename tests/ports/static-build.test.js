import { strict as assert } from 'assert';
import { test } from 'node:test';
import { generateStatic } from '../../ports/static-build.js';
import { StaticGeneratorAdapter } from '../../adapters/static-generator.js';
import { IndexPresenter } from '../../presenters/index.js';
import { ConfigPort } from '../../ports/interfaces.js';
import { rm, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

class MockConfig extends ConfigPort {
  constructor() {
    super();
    this.store = new Map();
  }

  get(key) {
    if (!this.store.has(key)) {
      throw new Error(`Config key "${key}" not found`);
    }
    return this.store.get(key);
  }

  set(key, value) {
    if (value === undefined) {
      this.store.delete(key);
    } else {
      this.store.set(key, value);
    }
  }

  clear() {
    this.store.clear();
  }
}

test('Static Build', async (t) => {
  const baseTestDir = join(process.cwd(), 'test-output');
  let testDir;
  let testCount = 0;
  let config;
  let presenter;
  let generator;
  
  // Setup test directory and dependencies before each test
  t.beforeEach(async () => {
    testCount++;
    testDir = join(baseTestDir, `test-${testCount}`);
    config = new MockConfig();
    presenter = new IndexPresenter();
    generator = new StaticGeneratorAdapter();

    try {
      await rm(testDir, { recursive: true, force: true }).catch(() => {});
      await mkdir(testDir, { recursive: true });
      
      // Set required config values
      config.set('apiBase', 'https://test-api.example.com');
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error; // Re-throw to fail the test
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

  await t.test('should transform API endpoints and generate HTML', async () => {
    const testFile = join(testDir, 'index.html');
    const content = {
      features: [
        { 
          endpoint: '/api/version', 
          name: 'Version',
          states: {
            checking: { type: 'loading', message: 'Loading...' },
            success: { type: 'success' },
            error: { type: 'error', message: 'Error loading version' }
          }
        },
        { 
          endpoint: '/api/status', 
          name: 'Database',
          states: {
            checking: { type: 'loading', message: 'Checking...' },
            success: { type: 'success' },
            error: { type: 'error', message: 'Error checking status' }
          }
        },
        { 
          endpoint: '/static/file', 
          name: 'Static',
          states: {
            checking: { type: 'loading', message: 'Loading...' },
            success: { type: 'success' },
            error: { type: 'error', message: 'Error loading file' }
          }
        },
        { 
          endpoint: 'https://external.com', 
          name: 'External',
          states: {
            checking: { type: 'loading', message: 'Loading...' },
            success: { type: 'success' },
            error: { type: 'error', message: 'Error loading external' }
          }
        }
      ]
    };

    // Override generator to write to test file
    const originalWriteFile = generator.writeFile;
    generator.writeFile = async (_, html) => {
      await originalWriteFile(testFile, html);
      return true;
    };

    try {
      const result = await generateStatic(content, config, presenter, generator);
      assert.equal(result, true);

      const html = await readFile(testFile, 'utf8');
      assert(html.includes('https://test-api.example.com/api/version'));
      assert(html.includes('https://test-api.example.com/api/status'));
      assert(html.includes('/static/file'));
      assert(html.includes('https://external.com'));
    } finally {
      generator.writeFile = originalWriteFile;
    }
  });

  await t.test('should handle file system errors correctly', async () => {
    const content = { 
      features: [
        {
          endpoint: '/api/test',
          name: 'Test',
          states: {
            checking: { type: 'loading', message: 'Loading...' },
            success: { type: 'success' },
            error: { type: 'error', message: 'Error loading test' }
          }
        }
      ]
    };

    // Mock file system error
    const originalWriteFile = generator.writeFile;
    generator.writeFile = async () => {
      throw new Error('Permission denied');
    };

    try {
      await generateStatic(content, config, presenter, generator);
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert(error.message.includes('Permission denied'));
    } finally {
      generator.writeFile = originalWriteFile;
    }
  });

  await t.test('should handle invalid content', async () => {
    const invalidContent = {};
    
    try {
      await generateStatic(invalidContent, config, presenter, generator);
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert(error.message.includes('Invalid content structure'));
    }
  });

  await t.test('should handle missing API base URL', async () => {
    const content = { features: [] };
    config.set('apiBase', undefined);
    
    try {
      await generateStatic(content, config, presenter, generator);
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert(error.message.includes('API base URL not configured'));
    }
  });
}); 