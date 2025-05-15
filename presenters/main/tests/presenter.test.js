import assert from 'node:assert';
import { describe, it } from 'node:test';
import { IndexPresenter } from '../presenter.js';

describe('Index Presenter', () => {
  const mockContent = {
    title: 'Test Title',
    description: 'Test Description',
    repoUrl: 'https://github.com/test/repo',
    features: [
      {
        id: 'test-feature',
        name: 'Test Feature',
        endpoint: 'https://api.example.com/test',
        states: {
          checking: { type: 'loading', message: 'Checking...' },
          success: { type: 'success' },
          error: { type: 'error', message: 'Error' }
        }
      }
    ]
  };

  describe('format', () => {
    it('should generate HTML without CSP meta tag', () => {
      const presenter = new IndexPresenter();
      const html = presenter.format(mockContent);
      
      // Should include content
      assert.ok(html.includes('<title>Test Title</title>'));
      assert.ok(html.includes('<h1>Test Title</h1>'));
      assert.ok(html.includes('<p>Test Description</p>'));
      assert.ok(html.includes('https://github.com/test/repo'));
      
      // Should NOT include CSP meta tag
      assert.ok(!html.includes('Content-Security-Policy'));
      assert.ok(!html.includes('frame-ancestors'));
    });

    it('should use external script and window.appFeatures', () => {
      const presenter = new IndexPresenter();
      const html = presenter.format(mockContent);
      
      // Should include external script
      assert.ok(html.includes('<script src="/presenters/static/assets/js/status-checker.js"></script>'));
      
      // Should define appFeatures in window object
      assert.ok(html.includes('window.appFeatures ='));
      
      // Should include feature data
      assert.ok(html.includes('"id":"test-feature"'));
      assert.ok(html.includes('"name":"Test Feature"'));
      assert.ok(html.includes('"endpoint":"https://api.example.com/test"'));
      
      // Should not include the old inline function
      assert.ok(!html.includes('async function checkStatus('));
    });
  });

  describe('formatError', () => {
    it('should generate error HTML without CSP meta tag', () => {
      const presenter = new IndexPresenter();
      const mockError = new Error('Test Error');
      const html = presenter.formatError(mockError);
      
      // Should include error message
      assert.ok(html.includes('<title>Error</title>'));
      assert.ok(html.includes('<h1>Error</h1>'));
      assert.ok(html.includes('<p>Test Error</p>'));
      
      // Should NOT include CSP meta tag
      assert.ok(!html.includes('Content-Security-Policy'));
      assert.ok(!html.includes('frame-ancestors'));
    });
  });
}); 