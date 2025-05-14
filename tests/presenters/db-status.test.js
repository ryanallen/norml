import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DbStatusPresenter } from '../../presenters/db-status.js';

describe('DbStatusPresenter', () => {
  let presenter;
  let mockResponse;

  it('should format basic status correctly', () => {
    presenter = new DbStatusPresenter();
    const input = {
      connected: true,
      poolSize: 5,
      available: 3,
      lastError: null,
      timestamp: '2024-03-20T12:00:00Z'
    };
    
    const result = presenter.format(input);
    assert.deepStrictEqual(result, {
      status: 'available',
      time: '2024-03-20T12:00:00Z',
      connection: {
        poolSize: 5,
        availableConnections: 3,
        isConnected: true
      }
    });
  });

  it('should format comprehensive status correctly', () => {
    presenter = new DbStatusPresenter();
    const input = {
      connected: true,
      poolSize: 5,
      available: 3,
      timestamp: '2024-03-20T12:00:00Z',
      ping: {
        success: true,
        latency: 50
      },
      stats: {
        version: '7.0.5',
        uptime: 86400,
        connections: { current: 10, available: 100 },
        memory: {
          resident: 1024 * 1024 * 100,  // 100MB
          virtual: 1024 * 1024 * 500,   // 500MB
          mapped: 1024 * 1024 * 50      // 50MB
        }
      }
    };
    
    const result = presenter.format(input);
    assert.deepStrictEqual(result, {
      status: 'available',
      time: '2024-03-20T12:00:00Z',
      connection: {
        poolSize: 5,
        availableConnections: 3,
        isConnected: true
      },
      ping: {
        success: true,
        latencyMs: 50
      },
      server: {
        version: '7.0.5',
        uptime: '1d',
        connections: { current: 10, available: 100 },
        memory: {
          resident: '100 MB',
          virtual: '500 MB',
          mapped: '50 MB'
        }
      }
    });
  });

  it('should format status with error correctly', () => {
    presenter = new DbStatusPresenter();
    const input = {
      connected: false,
      poolSize: 0,
      available: 0,
      lastError: {
        message: 'Connection refused',
        timestamp: '2024-03-20T11:59:00Z'
      },
      timestamp: '2024-03-20T12:00:00Z'
    };
    
    const result = presenter.format(input);
    assert.deepStrictEqual(result, {
      status: 'unavailable',
      time: '2024-03-20T12:00:00Z',
      connection: {
        poolSize: 0,
        availableConnections: 0,
        isConnected: false
      },
      lastError: {
        message: 'Connection refused',
        time: '2024-03-20T11:59:00Z'
      }
    });
  });

  it('should format uptime correctly', () => {
    presenter = new DbStatusPresenter();
    assert.equal(presenter.formatUptime(0), '< 1m');
    assert.equal(presenter.formatUptime(30), '< 1m');
    assert.equal(presenter.formatUptime(60), '1m');
    assert.equal(presenter.formatUptime(3600), '1h');
    assert.equal(presenter.formatUptime(86400), '1d');
    assert.equal(presenter.formatUptime(90000), '1d 1h');
    assert.equal(presenter.formatUptime(undefined), 'unknown');
  });

  it('should format memory sizes correctly', () => {
    presenter = new DbStatusPresenter();
    assert.equal(presenter.formatBytes(0), '0 B');
    assert.equal(presenter.formatBytes(1024), '1 KB');
    assert.equal(presenter.formatBytes(1024 * 1024), '1 MB');
    assert.equal(presenter.formatBytes(1024 * 1024 * 1024), '1 GB');
    assert.equal(presenter.formatBytes(undefined), '0 B');
  });

  it('should present status with correct headers', () => {
    presenter = new DbStatusPresenter();
    let responseCode, responseHeaders;
    
    mockResponse = {
      writeHead: (code, headers) => {
        responseCode = code;
        responseHeaders = headers;
      },
      end: () => {}
    };

    const status = {
      connected: true,
      timestamp: '2024-03-20T12:00:00Z'
    };

    presenter.present(mockResponse, status);

    assert.equal(responseCode, 200);
    assert.deepStrictEqual(responseHeaders, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
  });

  it('should present error with correct headers', () => {
    presenter = new DbStatusPresenter();
    let responseCode, responseHeaders;
    
    mockResponse = {
      writeHead: (code, headers) => {
        responseCode = code;
        responseHeaders = headers;
      },
      end: () => {}
    };

    presenter.presentError(mockResponse, new Error('Test error'));

    assert.equal(responseCode, 503);
    assert.deepStrictEqual(responseHeaders, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
  });
}); 