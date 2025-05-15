// Unified cleanup tool for both regular and test cleanups
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// List of files that have been moved or should be removed
const filesToRemove = [
  // Original files from cleanup.js
  'adapters/db.js',
  'adapters/cloud-client.js',
  'adapters/gcp.js',
  'adapters/config.js',
  'adapters/env.js',
  'adapters/test-cleanup.js',
  'logic/db-status.js',
  'logic/version.js',
  'logic/test-cleanup.js',
  'ports/db-status.js',
  'ports/db-api.js',
  'ports/version.js',
  'presenters/db.js',
  'presenters/db-status.js',
  'presenters/version.js',
  'tools/cleanup.js',
  'tests/presenters/index.test.js',
  // Additional files identified as moved/deleted
  'logic/static-file.js',
  'presenters/db.js',
  'presenters/version.js',
  'adapters/db.js',
  'tests/ports/headers.test.js',
  'tests/logic/static-file.test.js',
  'tests/presenters/static-file.test.js',
  'tests/adapters/db.test.js',
  'check-headers.js',
  'check-version.js',
  'check-root.js',
  'index.html',
  'tests/presenters/index.test.js',
  'assets/js/status-checker.js',
  'ports/build-static.js',
  'ports/static-build.js',
  'debug-build.js',
  'bin/build.js',
  'adapters/static-generator.js',
  'ports/static-file.js',
  'tests/adapters/static-file.test.js',
  'tools/cleanup.js'
];

// Regular file cleanup
export async function cleanup() {
  console.log('Starting cleanup of old files');
  let removedCount = 0;
  
  for (const file of filesToRemove) {
    try {
      const fullPath = path.join(process.cwd(), file);
      await fs.unlink(fullPath);
      console.log(`✅ Removed: ${file}`);
      removedCount++;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`⚠️ File already removed: ${file}`);
      } else {
        console.error(`❌ Error removing ${file}:`, error.message);
      }
    }
  }
  
  console.log(`Cleanup complete. Removed ${removedCount} files.`);
  return removedCount;
}

// Clean test files directory with Windows PowerShell-friendly approach
export async function cleanTestDirectories() {
  console.log('Cleaning up test directories with platform-appropriate methods...');
  const rootDir = process.cwd();
  
  // Primary target test directories
  const testDirs = [
    'test-files',
    'coverage',
    'test-output'
  ];
  
  for (const dir of testDirs) {
    try {
      const fullPath = path.join(rootDir, dir);
      console.log(`Attempting to clean: ${fullPath}`);
      
      if (!await pathExists(fullPath)) {
        console.log(`Directory does not exist: ${fullPath}`);
        continue;
      }
      
      // First try Node.js fs.rm (safest cross-platform option)
      try {
        await safeRemove(fullPath);
        console.log(`Successfully removed directory: ${dir}`);
      } catch (err) {
        console.error(`Error removing ${dir} with fs.rm: ${err.message}`);
        
        // If still exists, try platform-specific approaches
        if (await pathExists(fullPath)) {
          if (process.platform === 'win32') {
            // For Windows, use PowerShell with multiple approaches
            const success = await cleanWithPowerShell(fullPath);
            if (success) {
              console.log(`Successfully removed ${dir} with PowerShell`);
            } else {
              console.error(`Failed to remove ${dir} with all methods`);
            }
          } else {
            // For Unix systems, try more aggressive rm command
            try {
              execSync(`rm -rf "${fullPath}"`, { stdio: 'pipe' });
              console.log(`Removed directory with rm command: ${fullPath}`);
            } catch (unixErr) {
              console.error(`Failed to remove with Unix rm: ${unixErr.message}`);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error processing directory ${dir}:`, err.message);
    }
  }
  
  console.log('Test directory cleanup complete');
}

// Helper functions
async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeRemove(path) {
  // Try up to 3 times, with a short delay
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Optionally force garbage collection if available
      if (global.gc) global.gc();
      await fs.rm(path, { recursive: true, force: true, maxRetries: 3 });
      console.log(`Successfully removed with fs.rm: ${path}`);
      return true;
    } catch (err) {
      console.error(`Attempt ${attempt} failed to remove with fs.rm: ${err.message}`);
      if (attempt === 3) {
        // On Windows, try PowerShell as a last resort
        if (process.platform === 'win32') {
          try {
            const psCmd = `Remove-Item -Path \"${path}\" -Recurse -Force`;
            console.log(`Trying PowerShell fallback: ${psCmd}`);
            const result = execSync(psCmd, { shell: 'powershell.exe', stdio: 'pipe' });
            if (result) console.log(`PowerShell output: ${result.toString().trim()}`);
            console.log(`Removed directory with PowerShell: ${path}`);
            return true;
          } catch (psErr) {
            console.error(`PowerShell fallback failed: ${psErr.message}`);
            if (psErr.stdout) console.error('PowerShell stdout:', psErr.stdout.toString());
            if (psErr.stderr) console.error('PowerShell stderr:', psErr.stderr.toString());
          }
        }
        console.error(`Failed to remove ${path}: ${err.message}`);
        throw err;
      }
      // Wait a bit before retrying
      await wait(200);
    }
  }
}

async function cleanWithPowerShell(path) {
  console.log(`Attempting PowerShell cleanup for: ${path}`);
  
  try {
    // Try PowerShell removal with short path to avoid path length issues
    const escapedPath = path.replace(/'/g, '\'\'');
    
    // Try with both Get-Item and wildcard approaches
    const attempts = [
      // Attempt 1: Use standard Remove-Item
      `Remove-Item -Path '${escapedPath}' -Recurse -Force -ErrorAction Stop`,
      
      // Attempt 2: Try with wildcard to remove contents first
      `Get-ChildItem -Path '${escapedPath}' -Recurse | Remove-Item -Force -Recurse; Remove-Item '${escapedPath}' -Force`
    ];
    
    // Try each PowerShell approach in sequence
    for (const [index, cmd] of attempts.entries()) {
      try {
        execSync(`powershell.exe -NoProfile -Command "${cmd}"`, { stdio: 'pipe' });
        console.log(`Successfully removed using PowerShell approach #${index + 1}: ${path}`);
        return true;
      } catch (psErr) {
        console.log(`PowerShell approach #${index + 1} failed: ${psErr.message}`);
      }
    }
    
    // If we get here, all PowerShell attempts failed
    console.log(`All PowerShell approaches failed to remove: ${path}`);
    return false;
  } catch (err) {
    console.error(`PowerShell cleanup error for ${path}:`, err.message);
    return false;
  }
}

// Combined cleanup function for both files and test directories
export async function fullCleanup() {
  console.log('Starting full cleanup process...');
  
  try {
    // First clean up old files
    await cleanup();
    
    // Then clean up test directories
    await cleanTestDirectories();
    
    console.log('Full cleanup completed');
    return { success: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Cleanup process failed:', error.message);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message, timestamp: new Date().toISOString() };
  }
}

// ES Module compatible direct execution check
const isDirectlyExecuted = () => {
  if (process.argv[1]) {
    const modulePath = fileURLToPath(import.meta.url);
    return process.argv[1] === modulePath;
  }
  return false;
};

// Run if executed directly
if (isDirectlyExecuted()) {
  const doFullCleanup = process.argv.includes('fullCleanup');
  
  // Use an IIFE to handle top-level await
  (async () => {
    try {
      if (doFullCleanup) {
        console.log('Performing full cleanup (including test directories)');
        const result = await fullCleanup();
        console.log('Cleanup complete with result:', result.success ? 'SUCCESS' : 'FAILURE');
      } else {
        console.log('Performing basic file cleanup only');
        const count = await cleanup();
        console.log(`Basic cleanup completed, removed ${count} files`);
      }
    } catch (error) {
      console.error('Cleanup failed:', error.message);
      console.error('Error stack:', error.stack);
      process.exit(1);
    }
  })();
} 