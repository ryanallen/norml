/**
 * Presenter Port
 * Provides compatibility between the Presenter interface in ports and the BasePresenter in presenters
 */
import { Presenter } from './ports.js';

/**
 * Create a presenter port that wraps any presenter from the presenters layer
 * @param {Object} presenter - A presenter object from the presenters layer
 * @returns {Presenter} - A port-compatible presenter
 */
export function createPresenterAdapter(presenter) {
  // Create an adapter that implements the Presenter port interface
  // but delegates to the presenter from the presenters layer
  return {
    format: (data) => presenter.format(data),
    formatError: (error) => presenter.formatError(error),
    present: (res, data) => presenter.present(res, data),
    presentError: (res, error) => presenter.presentError(res, error)
  };
}

/**
 * Get a presenter adapter for a specific domain
 * This allows ports to get presenters without directly importing from the presenters layer
 * @param {string} domain - The domain for the presenter (e.g., 'db', 'api', 'static')
 * @param {string} name - The specific presenter name (e.g., 'status', 'version', 'file')
 * @returns {Promise<Presenter>} - A promise that resolves to a port-compatible presenter
 */
export async function getPresenter(domain, name) {
  try {
    // Dynamically import the presenter
    const module = await import(`../../presenters/${domain}/${name}.js`);
    
    // Return the adapter wrapping the presenter
    return createPresenterAdapter(module.presenter || module.default);
  } catch (error) {
    console.error(`Failed to load presenter ${domain}/${name}:`, error);
    throw new Error(`Presenter ${domain}/${name} not found`);
  }
} 