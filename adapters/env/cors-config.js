/**
 * CORS Configuration Adapter
 * Implements proper isolation of configuration for CORS headers
 */

// Import necessary interfaces
import { ConfigPort } from '../../ports/interfaces/config-port.js';

export class CorsConfigAdapter extends ConfigPort {
  /**
   * Returns the array of allowed origins for CORS
   * In production, this could also load from environment or secrets
   */
  getAllowedOrigins() {
    return [
      'https://norml.ai',
      'http://localhost:3001',
      'http://localhost:3000'
    ];
  }
  
  /**
   * Checks if an origin is allowed by the CORS policy
   * @param {string} origin - The origin to check
   * @returns {boolean} Whether the origin is allowed
   */
  isOriginAllowed(origin) {
    if (!origin) return false;
    
    const allowedOrigins = this.getAllowedOrigins();
    return allowedOrigins.includes(origin);
  }
}

// Export a singleton instance
export const corsConfig = new CorsConfigAdapter(); 