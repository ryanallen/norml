// Test cleanup port
// Entry point for running the test cleanup
import { cleanupTestOutput } from '../logic/test-cleanup.js';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Direct cleanup with cmd commands on Windows
async function directCleanup() {
  console.log('Performing direct cleanup...');
  const rootDir = process.cwd();
  console.log('Root directory:', rootDir);
  
  // List of paths to clean
  const pathsToClean = [
    path.join(rootDir, 'test-output'),
    path.join(rootDir, 'tests', 'coverage')
  ];
  
  // Also look for test-* directories
  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('test-') && entry.name !== 'test-cleanup.js') {
        pathsToClean.push(path.join(rootDir, entry.name));
      }
    }
  } catch (err) {
    console.error('Error reading directory:', err);
  }
  
  console.log('Paths to clean:', pathsToClean);
  
  // Clean each path using platform-specific commands for better reliability
  for (const pathToClean of pathsToClean) {
    try {
      console.log(`Removing: ${pathToClean}`);
      
      if (process.platform === 'win32') {
        // On Windows, check if it's a symbolic link
        try {
          const stats = await fs.lstat(pathToClean);
          if (stats.isSymbolicLink()) {
            console.log(`Found symbolic link at ${pathToClean}, removing link only`);
            try {
              // Remove just the symlink
              execSync(`rmdir "${pathToClean}"`, { stdio: 'ignore' });
              console.log(`Successfully removed symlink: ${pathToClean}`);
              continue;  // Skip to next path
            } catch (linkErr) {
              console.error(`Error removing symlink: ${linkErr.message}`);
            }
          }
        } catch (lstatErr) {
          console.log(`Error checking if path is symlink: ${lstatErr.message}`);
        }
        
        // Use cmd prompt commands for more reliable deletion on Windows
        try {
          console.log(`Using attrib to remove read-only attributes`);
          execSync(`attrib -R -S -H "${pathToClean}\\*.*" /S /D`, { stdio: 'ignore' });
          
          console.log(`Using del to remove files`);
          execSync(`del /F /Q /S "${pathToClean}\\*.*"`, { stdio: 'ignore' });
          
          console.log(`Using rd to remove directories`);
          execSync(`rd /S /Q "${pathToClean}"`, { stdio: 'ignore' });
          
          console.log(`Successfully removed: ${pathToClean} (using Windows cmd commands)`);
        } catch (cmdErr) {
          console.log(`Windows removal command failed: ${cmdErr.message}`);
          console.log(`Falling back to PowerShell...`);
          
          try {
            // Try PowerShell as a last resort
            execSync(`powershell.exe -Command "Remove-Item -Path '${pathToClean}' -Recurse -Force"`, 
              { stdio: 'ignore' });
            console.log(`Successfully removed: ${pathToClean} (using PowerShell)`);
          } catch (psErr) {
            console.log(`PowerShell removal failed: ${psErr.message}`);
            console.log(`Trying Node.js fs.rm...`);
            
            await fs.rm(pathToClean, { recursive: true, force: true });
            console.log(`Successfully removed: ${pathToClean} (using fs.rm)`);
          }
        }
      } else {
        // Use rm command on Unix
        try {
          execSync(`rm -rf "${pathToClean}"`, { stdio: 'ignore' });
          console.log(`Successfully removed: ${pathToClean} (using rm command)`);
        } catch (cmdErr) {
          console.log(`Unix removal command failed, trying fs.rm: ${cmdErr.message}`);
          await fs.rm(pathToClean, { recursive: true, force: true });
          console.log(`Successfully removed: ${pathToClean} (using fs.rm)`);
        }
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log(`Path does not exist: ${pathToClean}`);
      } else {
        console.error(`Error removing ${pathToClean}:`, err);
      }
    }
  }
  
  console.log('Direct cleanup completed');
}

export async function cleanup() {
  console.log('Starting test cleanup process...');
  
  // First try direct cleanup
  await directCleanup();
  
  // Then use the logic layer cleanup
  try {
    const result = await cleanupTestOutput();
    console.log('Cleanup result:', result);
    if (result.success) {
      console.log(`✅ Test cleanup complete. Removed ${result.cleanedItems} items.`);
      return true;
    } else {
      console.error('❌ Test cleanup failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Unhandled error in test cleanup:', error);
    return false;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running test cleanup directly from command line');
  console.log('import.meta.url:', import.meta.url);
  console.log('process.argv[1]:', process.argv[1]);
  
  // Use an IIFE to handle top-level await
  (async () => {
    const success = await cleanup();
    console.log('Cleanup completed with success:', success);
    process.exit(success ? 0 : 1);
  })();
} 