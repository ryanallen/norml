/**
 * Features Logic Implementation - RHOMBUS Architecture
 * 
 * Contains pure business logic for feature management
 * - No dependencies on HTTP, presentation, or external systems
 * - Pure business rules and data management
 */

/**
 * Features business logic class
 */
export class FeaturesLogic {
  constructor() {
    // Define feature configurations
    this.features = [
      {
        id: 'database-status',
        name: 'Database Status',
        endpoint: '/api/db/status',
        states: {
          checking: {
            type: 'loading',
            message: 'Checking...'
          },
          success: {
            type: 'success',
            message: 'Connected. Last checked: {checkedAt}'
          },
          error: {
            type: 'error',
            message: 'Failed to connect: {error}'
          }
        }
      },
      {
        id: 'version',
        name: 'Version',
        endpoint: '/api/version',
        states: {
          checking: {
            type: 'loading',
            message: 'Loading...'
          },
          success: {
            type: 'success',
            message: 'Version {version}, Built: {buildDate}'
          },
          error: {
            type: 'error',
            message: 'Failed to load version: {error}'
          }
        }
      }
    ];
  }

  /**
   * Get all available features
   * @returns {Array} List of features
   */
  getFeatures() {
    return [...this.features];
  }
  
  /**
   * Get feature by ID
   * @param {string} id - Feature ID
   * @returns {Object|null} Feature object or null if not found
   */
  getFeatureById(id) {
    if (!id) return null;
    return this.features.find(feature => feature.id === id) || null;
  }
}

// Export singleton instance
const featuresLogic = new FeaturesLogic();
export default featuresLogic; 