// Test index page presenter
import test from 'node:test';
import assert from 'node:assert';
import { formatIndexPage } from '../../presenters/index.js';

test('Index presenter formats HTML correctly', () => {
  const mockContent = {
    title: 'Test Title',
    version: '0.0.1-test',
    features: [
      {
        name: 'Test Feature',
        endpoint: '/test'
      }
    ]
  };
  
  const html = formatIndexPage(mockContent);
  
  // Check basic HTML structure
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('</html>'));
  
  // Check content insertion
  assert.ok(html.includes(mockContent.title));
  assert.ok(html.includes(mockContent.version));
  assert.ok(html.includes(mockContent.features[0].endpoint));
  
  // Check required elements
  assert.ok(html.includes('<button id="check">'));
  assert.ok(html.includes('<pre id="result">'));
  
  // Check script functionality
  assert.ok(html.includes('addEventListener'));
  assert.ok(html.includes('fetch'));
}); 