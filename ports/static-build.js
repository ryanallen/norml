import { prepareStaticContent } from '../logic/static-build.js';

export async function generateStatic(content, config, presenter, generator) {
  try {
    // Prepare content with API base URL
    const preparedContent = prepareStaticContent(content, config);
    
    // Generate HTML using presenter
    const html = presenter.format(preparedContent);
    
    // Write to file using generator
    await generator.writeOutput(html, 'index.html');
    
    return true;
  } catch (error) {
    console.error('Static generation failed:', error);
    throw error;
  }
} 