import { describe, it } from 'node:test';
import assert from 'node:assert';
import { VersionPresenter } from '../../presenters/version.js';

describe('VersionPresenter', () => {
  let presenter;
  let mockResponse;

  it('formats version correctly', () => {
    presenter = new VersionPresenter();
    const result = presenter.format('1.0.0');
    
    assert.strictEqual(result.status, 'available');
    assert.strictEqual(result.version, '1.0.0');
    assert.ok(result.time); // Should be ISO timestamp
  });

  it('formats error correctly', () => {
    presenter = new VersionPresenter();
    const error = new Error('Version not found');
    const result = presenter.formatError(error);
    
    assert.strictEqual(result.status, 'error');
    assert.strictEqual(result.error, 'Version not found');
    assert.ok(result.time); // Should be ISO timestamp
  });

  it('presents version with 200 status', () => {
    presenter = new VersionPresenter();
    let responseCode, responseHeaders, responseBody;
    
    mockResponse = {
      writeHead: (code, headers) => {
        responseCode = code;
        responseHeaders = headers;
      },
      end: (body) => {
        responseBody = body;
      }
    };

    presenter.present(mockResponse, '1.0.0');

    assert.strictEqual(responseCode, 200);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });
    
    const data = JSON.parse(responseBody);
    assert.strictEqual(data.status, 'available');
    assert.strictEqual(data.version, '1.0.0');
    assert.ok(data.time);
  });

  it('presents error with 503 status', () => {
    presenter = new VersionPresenter();
    let responseCode, responseHeaders, responseBody;
    
    mockResponse = {
      writeHead: (code, headers) => {
        responseCode = code;
        responseHeaders = headers;
      },
      end: (body) => {
        responseBody = body;
      }
    };

    const error = new Error('Version not found');
    presenter.presentError(mockResponse, error);

    assert.strictEqual(responseCode, 503);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });
    
    const data = JSON.parse(responseBody);
    assert.strictEqual(data.status, 'error');
    assert.strictEqual(data.error, 'Version not found');
    assert.ok(data.time);
  });
}); 