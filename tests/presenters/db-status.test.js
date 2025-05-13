import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DbStatusPresenter } from '../../presenters/db-status.js';

describe('DbStatusPresenter', () => {
  let presenter;
  let mockResponse;

  it('should format connected status correctly', () => {
    presenter = new DbStatusPresenter();
    const input = {
      connected: true,
      lastError: null,
      timestamp: '2024-03-20T12:00:00Z'
    };
    
    const result = presenter.format(input);
    assert.deepStrictEqual(result, {
      status: 'available',
      time: '2024-03-20T12:00:00Z'
    });
  });

  it('should format disconnected status correctly', () => {
    presenter = new DbStatusPresenter();
    const input = {
      connected: false,
      lastError: null,
      timestamp: '2024-03-20T12:00:00Z'
    };
    
    const result = presenter.format(input);
    assert.deepStrictEqual(result, {
      status: 'unavailable',
      time: '2024-03-20T12:00:00Z'
    });
  });

  it('should format error correctly', () => {
    presenter = new DbStatusPresenter();
    const error = new Error('Connection failed');
    
    const result = presenter.formatError(error);
    assert.deepStrictEqual(result, {
      status: 'error',
      message: 'Connection failed'
    });
  });

  it('should present connected status with 200', () => {
    presenter = new DbStatusPresenter();
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

    const status = {
      connected: true,
      lastError: null,
      timestamp: '2024-03-20T12:00:00Z'
    };

    presenter.present(mockResponse, status);

    assert.strictEqual(responseCode, 200);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });
    assert.deepStrictEqual(
      JSON.parse(responseBody),
      {
        status: 'available',
        time: '2024-03-20T12:00:00Z'
      }
    );
  });

  it('should present disconnected status with 503', () => {
    presenter = new DbStatusPresenter();
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

    const status = {
      connected: false,
      lastError: null,
      timestamp: '2024-03-20T12:00:00Z'
    };

    presenter.present(mockResponse, status);

    assert.strictEqual(responseCode, 503);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });
    assert.deepStrictEqual(
      JSON.parse(responseBody),
      {
        status: 'unavailable',
        time: '2024-03-20T12:00:00Z'
      }
    );
  });

  it('should present error with 503', () => {
    presenter = new DbStatusPresenter();
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

    const error = new Error('Connection failed');
    presenter.presentError(mockResponse, error);

    assert.strictEqual(responseCode, 503);
    assert.deepStrictEqual(responseHeaders, { 'Content-Type': 'application/json' });
    assert.deepStrictEqual(
      JSON.parse(responseBody),
      {
        status: 'error',
        message: 'Connection failed'
      }
    );
  });
}); 