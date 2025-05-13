// Server error handling logic

// Determine if a route was not found
export function isNotFound(req) {
  return !req.route;
}

// Get error details
export function getErrorDetails(req) {
  if (isNotFound(req)) {
    return {
      status: 404,
      error: "not_found",
      message: "Not found"
    };
  }
  
  // Default server error
  return {
    status: 500,
    error: "server_error",
    message: "Internal server error"
  };
} 