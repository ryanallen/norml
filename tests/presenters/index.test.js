// Test index page presenter
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatIndexPage } from '../../presenters/index.js';

test('Index presenter', async (t) => {
  await t.test('formats HTML correctly', () => {
    const content = {
      title: 'Test Title',
      version: '0.1.0-alpha.1',
      features: [
        { name: 'Test Feature', endpoint: '/test' }
      ]
    };

    const result = formatIndexPage(content);
    assert.match(result, /<!DOCTYPE html>/);
    assert.match(result, /<title>Test Title<\/title>/);
    assert.match(result, /Version: 0\.1\.0-alpha\.1/);
    assert.match(result, /fetch\('\/test'\)/);
  });
}); 