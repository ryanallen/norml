import assert from 'node:assert';
import { describe, it } from 'node:test';
import { ResponseHeaders } from '../../ports/headers.js';

describe('Response Headers', () => {
  describe('getDefaultHeaders', () => {
    it('should include Content-Type header', () => {
      const headers = ResponseHeaders.getDefaultHeaders();
      assert.strictEqual(headers['Content-Type'], 'application/json; charset=utf-8');
    });
    
    it('should include security headers', () => {
      const headers = ResponseHeaders.getDefaultHeaders();
      assert.strictEqual(headers['X-Content-Type-Options'], 'nosniff');
      assert.ok(headers['Content-Security-Policy']);
    });
    
    it('should include CORS headers', () => {
      const headers = ResponseHeaders.getDefaultHeaders();
      assert.strictEqual(headers['Access-Control-Allow-Origin'], '*');
      assert.ok(headers['Access-Control-Allow-Methods']);
      assert.ok(headers['Access-Control-Allow-Headers']);
    });
    
    it('should include Cache-Control header without must-revalidate', () => {
      const headers = ResponseHeaders.getDefaultHeaders();
      assert.strictEqual(headers['Cache-Control'], 'no-store');
      assert.ok(!headers['Cache-Control'].includes('must-revalidate'));
    });
  });
  
  describe('getHeadersFor', () => {
    it('should set correct Content-Type for JSON', () => {
      const headers = ResponseHeaders.getHeadersFor('application/json');
      assert.strictEqual(headers['Content-Type'], 'application/json; charset=utf-8');
    });
    
    it('should set correct Content-Type for HTML', () => {
      const headers = ResponseHeaders.getHeadersFor('text/html');
      assert.strictEqual(headers['Content-Type'], 'text/html; charset=utf-8');
    });
    
    it('should not include charset for binary files', () => {
      const headers = ResponseHeaders.getHeadersFor('image/png');
      assert.strictEqual(headers['Content-Type'], 'image/png');
    });
    
    it('should set appropriate Cache-Control for images', () => {
      const headers = ResponseHeaders.getHeadersFor('image/jpeg');
      assert.strictEqual(headers['Cache-Control'], 'public, max-age=604800');
    });
    
    it('should set appropriate Cache-Control for HTML', () => {
      const headers = ResponseHeaders.getHeadersFor('text/html');
      assert.strictEqual(headers['Cache-Control'], 'no-store');
    });
    
    it('should use provided Cache-Control when specified', () => {
      const customCache = 'public, max-age=3600';
      const headers = ResponseHeaders.getHeadersFor('text/html', customCache);
      assert.strictEqual(headers['Cache-Control'], customCache);
    });
  });
}); 