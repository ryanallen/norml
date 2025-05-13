import { describe, it } from 'node:test';
import assert from 'node:assert';
import { VersionPresenter } from '../../presenters/version.js';
import { TestResponse } from '../utils/test-response.js';

describe('VersionPresenter', () => {
  const presenter = new VersionPresenter();
  const VERSION = '1.0.0';
  const ERROR = new Error('Version not found');

  it('formats version correctly', () => {
    const result = presenter.format(VERSION);
    assert.strictEqual(result.status, 'available');
    assert.strictEqual(result.version, VERSION);
    assert.ok(result.time);
  });

  it('formats error correctly', () => {
    const result = presenter.formatError(ERROR);
    assert.strictEqual(result.status, 'error');
    assert.strictEqual(result.error, ERROR.message);
    assert.ok(result.time);
  });

  it('presents version with 200 status', () => {
    const res = new TestResponse();
    presenter.present(res, VERSION);

    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(res.headers, { 'Content-Type': 'application/json' });
    
    const data = res.getBodyJson();
    assert.strictEqual(data.status, 'available');
    assert.strictEqual(data.version, VERSION);
    assert.ok(data.time);
  });

  it('presents error with 500 status', () => {
    const res = new TestResponse();
    presenter.presentError(res, ERROR);

    assert.strictEqual(res.statusCode, 500);
    assert.deepStrictEqual(res.headers, { 'Content-Type': 'application/json' });
    
    const data = res.getBodyJson();
    assert.strictEqual(data.status, 'error');
    assert.strictEqual(data.error, ERROR.message);
    assert.ok(data.time);
  });
}); 