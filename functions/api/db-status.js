// Cloudflare Worker to check MongoDB connection
export async function onRequest(context) {
  try {
    // MongoDB Atlas Data API endpoint (using Data API instead of driver)
    const endpoint = 'https://data.mongodb-api.com/app/' + context.env.MONGODB_APP_ID + '/endpoint/data/v1/action/findOne';
    
    // Run a simple query to check connection
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': context.env.MONGODB_API_KEY,
      },
      body: JSON.stringify({
        dataSource: 'norml',
        database: 'test',
        collection: 'status',
        filter: { _id: 1 }
      }),
    });
    
    const data = await response.json();
    
    // Return success response
    return new Response(JSON.stringify({
      status: 'connected',
      time: new Date().toISOString(),
      server: 'MongoDB Atlas',
      details: 'Connection successful'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    // Return error response
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message,
      time: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 