// Test index page logic
import test from 'node:test';
import assert from 'node:assert';
import { getPageContent } from '../../logic/index.js';

test('Index page logic returns correct content structure', () => {
  const content = getPageContent();
  
  assert.strictEqual(typeof content.title, 'string');
  assert.ok(content.title.length > 0);
  
  assert.ok(Array.isArray(content.features));
  assert.ok(content.features.length > 0);
  
  content.features.forEach(feature => {
    assert.strictEqual(typeof feature.name, 'string');
    assert.strictEqual(typeof feature.endpoint, 'string');
    assert.ok(feature.endpoint.startsWith('/'));
  });
}); 