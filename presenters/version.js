// Version information presenter
export function formatVersion(version) {
  if (version === undefined) {
    throw new Error('Version is required');
  }
  return { version };
} 