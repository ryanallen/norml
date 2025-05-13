import { strict as assert } from 'assert';
import { test } from 'node:test';
import { generateStatic } from '../../ports/static-build.js';

test('Static Build', async (t) => {
  await t.test('should transform API endpoints and generate HTML', async () => {
    const mockContent = {
      features: [
        { endpoint: '/api/version', name: 'Version' },
        { endpoint: '/db', name: 'Database' }
      ]
    };

    const mockConfig = {
      apiBase: 'https://test-api.example.com'
    };

    const mockPresenter = {
      format: (content) => `<html>${JSON.stringify(content)}</html>`
    };

    const mockGenerator = {
      writeFile: async (filename, content) => {
        assert.equal(filename, 'index.html');
        assert.match(content, /test-api\.example\.com\/api\/version/);
        assert.match(content, /\/db/); // Non-API endpoint should remain unchanged
        return true;
      }
    };

    const result = await generateStatic(mockContent, mockConfig, mockPresenter, mockGenerator);
    assert.equal(result, true);
  });

  await t.test('should handle errors gracefully', async () => {
    const mockContent = { features: [] };
    const mockConfig = { apiBase: 'https://test.com' };
    const mockPresenter = {
      format: () => { throw new Error('Test error'); }
    };
    const mockGenerator = {
      writeFile: async () => true
    };

    const result = await generateStatic(mockContent, mockConfig, mockPresenter, mockGenerator);
    assert.equal(result, false);
  });

  await t.test('should only transform API endpoints', async () => {
    const mockContent = {
      features: [
        { endpoint: '/api/test', name: 'API Test' },
        { endpoint: '/static/file', name: 'Static' },
        { endpoint: 'https://external.com', name: 'External' }
      ]
    };

    const mockConfig = {
      apiBase: 'https://api.test.com'
    };

    const mockPresenter = {
      format: (content) => JSON.stringify(content)
    };

    const mockGenerator = {
      writeFile: async (filename, content) => {
        const parsed = JSON.parse(content);
        assert.equal(parsed.features[0].endpoint, 'https://api.test.com/api/test');
        assert.equal(parsed.features[1].endpoint, '/static/file');
        assert.equal(parsed.features[2].endpoint, 'https://external.com');
        return true;
      }
    };

    const result = await generateStatic(mockContent, mockConfig, mockPresenter, mockGenerator);
    assert.equal(result, true);
  });
}); 