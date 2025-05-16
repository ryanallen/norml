/**
 * Features API
 */

import { getResponseHeaders } from '../core/headers.js';
import { FeaturesPresenter } from '../../presenters/api/features.js';
import { featuresLogic } from '../../logic/features/index.js';

// Create a presenter instance
const featuresPresenter = new FeaturesPresenter();

/**
 * Handle features API request
 */
export async function handleFeaturesRequest(req, res, options = {}) {
  const { requestOrigin } = options;

  try {
    // Validate the request is GET
    if (req.method !== 'GET') {
      return featuresPresenter.presentError(res, new Error('Method not allowed'), requestOrigin);
    }
    
    // Get features data from logic layer
    const featuresData = featuresLogic.getFeatures();
    
    // Present the data
    return featuresPresenter.present(res, featuresData, requestOrigin);
  } catch (error) {
    console.error('[Features API] Error:', error);
    return featuresPresenter.presentError(res, error, requestOrigin);
  }
} 