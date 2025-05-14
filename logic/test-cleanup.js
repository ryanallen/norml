// Test output cleanup logic
// Handles cleaning up test artifacts to maintain clean workspace
import { testCleanup } from '../adapters/test-cleanup.js';

export async function cleanupTestOutput() {
  // Define patterns to clean up
  const patterns = [
    'test-output',   // Root test-output folder
    'tests/coverage', // Coverage reports
    'test-*'         // Any test-N folders
  ];
  
  return await testCleanup.cleanupTestOutput(patterns);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
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