// Test version adapter
import test from 'node:test';
import assert from 'node:assert/strict';
import { getPackageVersion } from '../../adapters/version.js';
import { join } from 'node:path';

test('Version adapter', async (t) => {
  await t.test('reads package.json', () => {
    const mockPackageJson = JSON.stringify({
      version: '0.1.0'
    });

    const mockFs = {
      readFileSync: (filePath, encoding) => {
        assert.strictEqual(encoding, 'utf8');
        assert.strictEqual(filePath, join(process.cwd(), 'package.json'), 'Should read package.json from current working directory');
        return mockPackageJson;
      }
    };

    const version = getPackageVersion(mockFs);
    assert.strictEqual(version, '0.1.0-alpha.1');
  });

  await t.test('handles missing package.json', () => {
    const mockFs = {
      readFileSync: (filePath, encoding) => {
        assert.strictEqual(encoding, 'utf8');
        assert.strictEqual(filePath, join(process.cwd(), 'package.json'), 'Should read package.json from current working directory');
        const error = new Error('ENOENT: no such file or directory');
        error.code = 'ENOENT';
        throw error;
      }
    };

    assert.throws(
      () => getPackageVersion(mockFs),
      (err) => {
        assert.strictEqual(err.message, 'Failed to read version information');
        return true;
      }
    );
  });

  await t.test('handles invalid package.json', () => {
    const mockFs = {
      readFileSync: (filePath, encoding) => {
        assert.strictEqual(encoding, 'utf8');
        assert.strictEqual(filePath, join(process.cwd(), 'package.json'), 'Should read package.json from current working directory');
        return '{ invalid json }';
      }
    };

    assert.throws(
      () => getPackageVersion(mockFs),
      (err) => {
        assert.strictEqual(err.message, 'Failed to read version information');
        return true;
      }
    );
  });
}); 