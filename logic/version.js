// Version information logic
import { getPackageVersion as defaultGetPackageVersion } from '../adapters/version.js';

export function getVersion(getPackageVersion = defaultGetPackageVersion) {
  console.log('[Version Logic] Requesting version from adapter');
  const version = getPackageVersion();
  console.log('[Version Logic] Providing version:', version);
  return version;
} 