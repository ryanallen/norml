// Test cleanup port
// Entry point for running the test cleanup
import { cleanupTestOutput } from '../logic/test-cleanup.js';

export async function cleanup() {
  try {
    const result = await cleanupTestOutput();
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
  const success = await cleanup();
  process.exit(success ? 0 : 1);
} 