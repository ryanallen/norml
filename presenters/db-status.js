// Database status response presenter

// Format database status for HTTP response
export function formatSuccessResponse(data) {
  return {
    status: data.available ? "available" : "unavailable",
    message: data.available ? "Connected" : "Failed",
    time: data.checkedAt.toISOString(),
    ...(data.errorType && { error: data.errorType })
  };
}

// Determine HTTP status code based on connection status
export function getStatusCode(data) {
  return data.available ? 200 : 503; // 200 OK or 503 Service Unavailable
} 