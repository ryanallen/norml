// Test output cleanup logic
// Handles cleaning up test artifacts to maintain clean workspace
import { testCleanup } from '../../adapters/test/cleanup.js';
import { promises as fs } from 'fs';
import path from 'path';

// Direct file system function to ensure test-output is removed
async function forceRemoveDirectory(dirPath) {
  console.log(`Force removing directory: ${dirPath}`);
  try {
    // Check if directory exists
    const stats = await fs.stat(dirPath);
    if (stats.isDirectory()) {
      console.log(`Directory exists, removing: ${dirPath}`);
      await fs.rm(dirPath, { recursive: true, force: true });
      console.log(`Successfully removed: ${dirPath}`);
      return true;
    } else {
      console.log(`Path exists but is not a directory: ${dirPath}`);
      return false;
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`Directory does not exist: ${dirPath}`);
      return true; // Already doesn't exist, so consider it "removed"
    }
    console.error(`Error removing directory ${dirPath}:`, err);
    return false;
  }
}

export async function cleanupTestOutput() {
  console.log('Starting cleanupTestOutput in logic layer');
  
  // Define patterns to clean up
  const patterns = [
    'test-output',   // Root test-output folder
    'tests/coverage', // Coverage reports
    'test-*',        // Any test-N folders
    'test-files'     // Add test-files for RHOMBUS compliance
  ];
  
  console.log('Patterns to clean up:', patterns);
  
  // First try to directly remove the test-output directory
  const rootDir = process.cwd();
  const testOutputPath = path.join(rootDir, 'test-output');
  const testsCoveragePath = path.join(rootDir, 'tests', 'coverage');
  const testFilesPath = path.join(rootDir, 'test-files');
  
  // Make sure these critical directories are removed
  await forceRemoveDirectory(testOutputPath);
  await forceRemoveDirectory(testsCoveragePath);
  await forceRemoveDirectory(testFilesPath);
  
  // Then use the adapter for the rest of the cleanup
  try {
    const result = await testCleanup.cleanupTestOutput(patterns);
    console.log('Cleanup result from adapter:', result);
    return result;
  } catch (error) {
    console.error('Error in cleanupTestOutput logic:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running test cleanup logic directly');
  try {
    const result = await cleanupTestOutput();
    if (result.success) {
      console.log(`✅ Test cleanup complete. Removed ${result.cleanedItems} items.`);
    } else {
      console.error('❌ Test cleanup failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unhandled error in test cleanup:', error);
    process.exit(1);
  }
} 