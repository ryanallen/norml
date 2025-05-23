// Version information logic

export async function getVersion(versionAdapter) {
  try {
    const versionInfo = await versionAdapter.getVersion();
    return {
      status: 'success',
      data: versionInfo
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

export function validateVersion(version) {
  if (!version) throw new Error('Version is required');
  return version;
}

export async function getBuildInfo(configAdapter) {
  return {
    version: await getVersion(),
    node: process.version,
    timestamp: new Date().toISOString(),
    environment: configAdapter ? configAdapter.get('NODE_ENV') || 'development' : 'development'
  };
} 