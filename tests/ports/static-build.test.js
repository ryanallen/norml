import { strict as assert } from 'assert';
import { test } from 'node:test';
import { generateStatic } from '../../ports/static-build.js';

test('Static build port', async (t) => {
  await t.test('orchestrates generation process', async () => {
    let writtenHtml = '';
    let writtenPath = '';

    const mockPresenter = {
      format: (content) => '<html>' + JSON.stringify(content) + '</html>'
    };
    
    const mockGenerator = {
      writeOutput: async (html, path) => {
        writtenHtml = html;
        writtenPath = path;
        return true;
      }
    };
    
    const testContent = {
      features: [{ endpoint: '/db' }]
    };
    
    const config = { apiBase: 'https://api.example.com' };
    
    await generateStatic(testContent, config, mockPresenter, mockGenerator);
    
    assert(writtenHtml.includes('api.example.com'));
    assert.equal(writtenPath, 'index.html');
  });

  await t.test('handles errors properly', async () => {
    const mockPresenter = {
      format: () => { throw new Error('Test error'); }
    };
    
    const mockGenerator = {
      writeOutput: async () => true
    };
    
    await assert.rejects(
      async () => {
        await generateStatic({}, {}, mockPresenter, mockGenerator);
      },
      /Test error/
    );
  });
}); 