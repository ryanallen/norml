import path from 'path';
import { fileURLToPath } from 'url';
import { StaticGeneratorAdapter } from '../../adapters/static/generator.js';
import { HtmlPresenter } from '../../presenters/static/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');

/**
 * Generate static HTML file using the provided content, configuration and generator
 * 
 * @param {object} content - The content to be formatted
 * @param {object} config - Configuration options
 * @param {object} presenter - The presenter to format the content
 * @param {object} generator - The generator adapter
 * @returns {Promise<boolean>} Success status
 */
export async function generateStatic(content, config, presenter, generator) {
  try {
    if (!content?.features) {
      throw new Error('Invalid content structure');
    }

    // Generate HTML
    const html = presenter.format(content);
    if (!html) {
      throw new Error('Failed to generate HTML');
    }
    
    // Write to file
    const outputFile = config?.outputFile || path.join(rootDir, 'index.html');
    await generator.writeFile(outputFile, html);
    return true;
  } catch (error) {
    console.error('Static generation failed:', error);
    throw error; // Propagate error for proper handling
  }
}

/**
 * Build the static site
 * Creates index.html and copies static assets
 */
async function build() {
  // Create presenter and generator instances
  const presenter = new HtmlPresenter();
  const generator = new StaticGeneratorAdapter();
  
  // Define content
  const content = {
    title: 'NORML App Status',
    description: 'Node.js application implementing RHOMBUS architecture',
    repoUrl: 'https://github.com/ryanallen/norml',
    features: [
      {
        id: 'db-status',
        name: 'Database Status',
        endpoint: 'https://norml-459701.uc.r.appspot.com/api/status/db',
        states: {
          checking: { type: 'loading', message: 'Checking...' },
          success: { type: 'success' },
          error: { type: 'error' }
        }
      },
      {
        id: 'version-info',
        name: 'Version',
        endpoint: 'https://norml-459701.uc.r.appspot.com/api/version',
        states: {
          checking: { type: 'loading', message: 'Loading...' }
        }
      }
    ]
  };
  
  // Config for the build
  const config = {
    outputFile: path.join(rootDir, 'index.html')
  };
  
  try {
    // Generate the HTML
    await generateStatic(content, config, presenter, generator);
    console.log('✅ Static HTML generated successfully');
    
    // Copy assets
    await generator.copyAssets();
    
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Only execute directly if run as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  build();
}

export { build }; 