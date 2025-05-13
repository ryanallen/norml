// Database status response presenter

// Format the response for the browser
export function formatSuccessResponse(data) {
  return {
    status: 'available',
    time: data.checkedAt.toISOString()
  };
}

// Get the right HTTP status code
export function getStatusCode() {
  return 200;
} 