import { strict as assert } from 'assert';
import { test } from 'node:test';
import { prepareStaticContent } from '../../logic/static-build.js';

test('Static build logic', async (t) => {
  await t.test('prepares content with API base', () => {
    const content = {
      features: [
        { endpoint: '/db' },
        { endpoint: '/api/version' }
      ]
    };
    const config = { apiBase: 'https://api.example.com' };
    
    const result = prepareStaticContent(content, config);
    
    assert.equal(result.features[0].endpoint, 'https://api.example.com/db');
    assert.equal(result.features[1].endpoint, 'https://api.example.com/api/version');
  });
}); 