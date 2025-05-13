// Server error response presenter

// Format error response
export function formatErrorResponse(errorDetails) {
  return {
    status: "error",
    message: errorDetails.message,
    error: errorDetails.error
  };
} 