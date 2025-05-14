import assert from 'node:assert';
import { describe, it } from 'node:test';
import { 
  isPathSafe, 
  determineCachePolicy, 
  shouldIncludeCharset,
  getSecurityHeaders,
  processStaticFileRequest 
} from '../../logic/static-file.js';

describe('Static File Logic', () => {
  describe('isPathSafe', () => {
    it('should return true for safe paths', () => {
      assert.strictEqual(isPathSafe('/favicon.ico'), true);
      assert.strictEqual(isPathSafe('/images/logo.png'), true);
      assert.strictEqual(isPathSafe('/css/styles.css'), true);
    });

    it('should return false for paths with directory traversal', () => {
      assert.strictEqual(isPathSafe('../config.json'), false);
      assert.strictEqual(isPathSafe('../../secrets.txt'), false);
      assert.strictEqual(isPathSafe('/images/../../../etc/passwd'), false);
    });
  });

  describe('determineCachePolicy', () => {
    it('should return appropriate cache policy for images', () => {
      assert.strictEqual(determineCachePolicy('image/png'), 'public, max-age=86400, must-revalidate');
      assert.strictEqual(determineCachePolicy('image/jpeg'), 'public, max-age=86400, must-revalidate');
      assert.strictEqual(determineCachePolicy('image/svg+xml'), 'public, max-age=86400, must-revalidate');
    });

    it('should return no-store for HTML', () => {
      assert.strictEqual(determineCachePolicy('text/html'), 'no-store');
    });

    it('should return no-store for JSON', () => {
      assert.strictEqual(determineCachePolicy('application/json'), 'no-store');
    });

    it('should return default cache policy for other types', () => {
      assert.strictEqual(determineCachePolicy('text/css'), 'public, max-age=14400, must-revalidate');
      assert.strictEqual(determineCachePolicy('application/javascript'), 'public, max-age=14400, must-revalidate');
    });
  });

  describe('shouldIncludeCharset', () => {
    it('should return false for binary files', () => {
      assert.strictEqual(shouldIncludeCharset('image/png'), false);
      assert.strictEqual(shouldIncludeCharset('image/jpeg'), false);
      assert.strictEqual(shouldIncludeCharset('application/octet-stream'), false);
      assert.strictEqual(shouldIncludeCharset('application/pdf'), false);
      assert.strictEqual(shouldIncludeCharset('font/woff2'), false);
    });

    it('should return true for text files', () => {
      assert.strictEqual(shouldIncludeCharset('text/html'), true);
      assert.strictEqual(shouldIncludeCharset('text/css'), true);
      assert.strictEqual(shouldIncludeCharset('application/json'), true);
      assert.strictEqual(shouldIncludeCharset('text/plain'), true);
    });
  });

  describe('getSecurityHeaders', () => {
    it('should return security headers with X-Content-Type-Options', () => {
      const headers = getSecurityHeaders();
      assert.strictEqual(headers['X-Content-Type-Options'], 'nosniff');
    });

    it('should return security headers with Content-Security-Policy', () => {
      const headers = getSecurityHeaders();
      assert.ok(headers['Content-Security-Policy']);
      assert.ok(headers['Content-Security-Policy'].includes('unsafe-inline'));
      // We're not using unsafe-eval in our current implementation
      // If unsafe-eval is added later, uncomment this line
      // assert.ok(headers['Content-Security-Policy'].includes('unsafe-eval'));
    });
  });

  describe('processStaticFileRequest', () => {
    it('should return error for unsafe paths', () => {
      const result = processStaticFileRequest({
        path: '../config.json',
        exists: true,
        mimeType: 'application/json'
      });
      
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.status, 403);
    });

    it('should return error for non-existent files', () => {
      const result = processStaticFileRequest({
        path: '/not-found.txt',
        exists: false,
        mimeType: 'text/plain'
      });
      
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.status, 404);
    });

    it('should return success with appropriate headers for existing files', () => {
      const result = processStaticFileRequest({
        path: '/favicon.ico',
        exists: true,
        mimeType: 'image/x-icon'
      });
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.headers['Content-Type'], 'image/x-icon');
      assert.strictEqual(result.headers['Cache-Control'], 'public, max-age=86400, must-revalidate');
      assert.strictEqual(result.headers['X-Content-Type-Options'], 'nosniff');
    });

    it('should include charset for text files', () => {
      const result = processStaticFileRequest({
        path: '/index.html',
        exists: true,
        mimeType: 'text/html'
      });
      
      assert.strictEqual(result.headers['Content-Type'], 'text/html; charset=UTF-8');
    });
  });
}); 