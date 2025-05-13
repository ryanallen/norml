// Database status response presenter

// Format the response for the browser
export function formatSuccessResponse(data) {
  return {
    status: data.available ? 'available' : 'unavailable',
    time: data.checkedAt.toISOString()
  };
}

// Get the right HTTP status code
export function getStatusCode(data) {
  return data.available ? 200 : 503;
} 