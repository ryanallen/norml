import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';
import { StaticFilePresenter } from '../../presenters/static-file.js';

describe('Static File Presenter', () => {
  let presenter;
  let mockResponse;
  
  beforeEach(() => {
    presenter = new StaticFilePresenter();
    
    // Create a mock response object
    mockResponse = {
      statusCode: null,
      headers: {},
      body: null,
      writeHead: function(statusCode, headers) {
        this.statusCode = statusCode;
        this.headers = headers;
      },
      end: function(body) {
        this.body = body;
      }
    };
  });
  
  describe('format', () => {
    it('should return file content unchanged', () => {
      const content = Buffer.from('test content');
      const result = presenter.format(content);
      assert.strictEqual(result, content);
    });
  });
  
  describe('formatError', () => {
    it('should format error with message and timestamp', () => {
      const error = new Error('Test error');
      const result = presenter.formatError(error);
      
      assert.strictEqual(result.error, 'Static File Error');
      assert.strictEqual(result.message, 'Test error');
      assert.strictEqual(result.status, 500);
      assert.ok(result.timestamp);
    });
    
    it('should include custom status code if provided', () => {
      const error = new Error('Not found');
      error.status = 404;
      const result = presenter.formatError(error);
      
      assert.strictEqual(result.status, 404);
    });
  });
  
  describe('present', () => {
    it('should set status code and headers', () => {
      const content = Buffer.from('test content');
      const headers = { 'Content-Type': 'text/plain' };
      
      presenter.present(mockResponse, content, headers);
      
      assert.strictEqual(mockResponse.statusCode, 200);
      assert.deepStrictEqual(mockResponse.headers, headers);
    });
    
    it('should set body to formatted content', () => {
      const content = Buffer.from('test content');
      presenter.present(mockResponse, content, {});
      
      assert.strictEqual(mockResponse.body, content);
    });
  });
  
  describe('presentError', () => {
    it('should set status code from error', () => {
      const error = new Error('Not found');
      error.status = 404;
      
      presenter.presentError(mockResponse, error);
      
      assert.strictEqual(mockResponse.statusCode, 404);
    });
    
    it('should set default status code if not in error', () => {
      const error = new Error('Generic error');
      
      presenter.presentError(mockResponse, error);
      
      assert.strictEqual(mockResponse.statusCode, 500);
    });
    
    it('should set JSON content type with charset', () => {
      const error = new Error('Test error');
      
      presenter.presentError(mockResponse, error);
      
      assert.ok(mockResponse.headers['Content-Type'].startsWith('application/json'));
      assert.ok(mockResponse.headers['Content-Type'].includes('charset=UTF-8'));
    });
    
    it('should set body to JSON string of formatted error', () => {
      const error = new Error('Test error');
      const formattedError = presenter.formatError(error);
      
      presenter.presentError(mockResponse, error);
      
      const parsedBody = JSON.parse(mockResponse.body);
      assert.strictEqual(parsedBody.error, formattedError.error);
      assert.strictEqual(parsedBody.message, formattedError.message);
    });
  });
}); 