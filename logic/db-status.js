// Database status check logic

// Try to connect to the database and tell us if it worked
export async function checkDbStatus(dbAdapter) {
  const client = await dbAdapter();
  await client.db('admin').command({ ping: 1 });
  await client.close();
  return {
    available: true,
    checkedAt: new Date()
  };
} 