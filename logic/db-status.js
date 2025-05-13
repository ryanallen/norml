// Business logic module - Contains core application logic

// Check if MongoDB database is available
export async function checkDbStatus(dbAdapter) {
  try {
    // Connect to MongoDB
    const client = await dbAdapter();
    // Verify connection with ping command
    await client.db('admin').command({ ping: 1 });
    // Close connection to avoid leaks
    await client.close();
    // Return success data
    return {
      available: true,
      checkedAt: new Date()
    };
  } catch (error) {
    // Return failure data with error information
    return {
      available: false,
      checkedAt: new Date(),
      errorType: error.name
    };
  }
} 