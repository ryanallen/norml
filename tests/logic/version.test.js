// Test version logic
import test from 'node:test';
import assert from 'node:assert';
import { getVersion } from '../../logic/version.js';

test('Version logic returns adapter version', async (t) => {
  const expectedVersion = '0.1.0-alpha.1';
  
  // Mock the version adapter
  const mockGetPackageVersion = () => expectedVersion;

  const version = getVersion(mockGetPackageVersion);
  assert.strictEqual(version, expectedVersion);
});

test('Version logic handles adapter errors', async (t) => {
  // Mock the version adapter to throw an error
  const mockGetPackageVersion = () => {
    throw new Error('Adapter error');
  };

  assert.throws(
    () => getVersion(mockGetPackageVersion),
    { message: 'Adapter error' }
  );
}); 