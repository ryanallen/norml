import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { IndexPresenter } from '../../presenters/index.js';

test('IndexPresenter', async (t) => {
  const presenter = new IndexPresenter();

  await t.test('formats content correctly', () => {
    const content = {
      title: 'Test Page',
      description: 'Test Description',
      repoUrl: 'https://github.com/test/repo',
      features: [{
        id: 'test-feature',
        name: 'Test Feature',
        endpoint: '/api/test',
        states: {
          checking: { message: 'Checking...' }
        }
      }]
    };

    const html = presenter.format(content);
    assert(html.includes('<title>Test Page</title>'));
    assert(html.includes('<h1>Test Page</h1>'));
    assert(html.includes('Test Description'));
    assert(html.includes('href="https://github.com/test/repo"'));
    assert(html.includes('View on GitHub'));
    assert(html.includes('id="test-feature"'));
    assert(html.includes('Test Feature'));
    assert(html.includes('Checking...'));
    assert(html.includes('/api/test'));
  });

  await t.test('formats version endpoint response correctly', () => {
    const content = {
      title: 'Test Page',
      features: [{
        id: 'version',
        name: 'Version',
        endpoint: '/api/version',
        states: {
          checking: { message: 'Checking...' }
        }
      }]
    };

    const html = presenter.format(content);
    assert(html.includes('if (feature.endpoint === \'/api/version\')'));
    assert(html.includes('updateElement(\'success\', data)'));
  });

  await t.test('formats db endpoint response correctly', () => {
    const content = {
      title: 'Test Page',
      features: [{
        id: 'db',
        name: 'Database',
        endpoint: '/api/status',
        states: {
          checking: { message: 'Checking...' }
        }
      }]
    };

    const html = presenter.format(content);
    assert(html.includes('if (data.status === \'available\')'));
    assert(html.includes('if (data.status === \'error\')'));
    assert(html.includes('Unexpected status:'));
  });

  await t.test('handles API errors correctly', () => {
    const content = {
      title: 'Test Page',
      features: [{
        id: 'test',
        name: 'Test',
        endpoint: '/api/test',
        states: {
          checking: { message: 'Checking...' }
        }
      }]
    };

    const html = presenter.format(content);
    assert(html.includes('catch (error)'));
    assert(html.includes('console.error(\'API call failed:\''));
    assert(html.includes('error.message || \'Failed to fetch status\''));
  });

  await t.test('formats error page correctly', () => {
    const error = new Error('Test error');
    const html = presenter.formatError(error);
    assert(html.includes('<title>Error</title>'));
    assert(html.includes('<h1>Error</h1>'));
    assert(html.includes('Test error'));
    assert(html.includes('class="error"'));
  });

  await t.test('presents content with correct headers', () => {
    const content = {
      title: 'Test',
      features: []
    };
    
    let headers;
    const res = {
      writeHead: (status, h) => { headers = h; },
      end: () => {}
    };

    presenter.present(res, content);
    assert.deepEqual(headers, { 'Content-Type': 'text/html' });
  });

  await t.test('presents error with correct headers', () => {
    const error = new Error('Test error');
    let status;
    let headers;
    
    const res = {
      writeHead: (s, h) => { 
        status = s;
        headers = h;
      },
      end: () => {}
    };

    presenter.presentError(res, error);
    assert.equal(status, 500);
    assert.deepEqual(headers, { 'Content-Type': 'text/html' });
  });
}); 