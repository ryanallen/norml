// Database status response presenter

// Format the response for the browser
export function formatSuccessResponse(data) {
  const response = {
    status: data.available ? 'available' : 'unavailable',
    time: data.checkedAt.toISOString()
  };
  
  if (!data.available && data.error) {
    response.error = data.error;
  }
  
  return response;
}

// Get the right HTTP status code
export function getStatusCode(data) {
  return data.available ? 200 : 503;
} 