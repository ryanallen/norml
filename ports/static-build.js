export async function generateStatic(content, config, presenter, generator) {
  try {
    if (!content?.features) {
      throw new Error('Invalid content structure');
    }

    if (!config?.apiBase) {
      throw new Error('API base URL not configured');
    }

    // Replace API base URL in content
    content.features = content.features.map(feature => ({
      ...feature,
      endpoint: feature.endpoint.startsWith('/api') 
        ? `${config.apiBase}${feature.endpoint}`
        : feature.endpoint
    }));

    // Generate HTML
    const html = presenter.format(content);
    if (!html) {
      throw new Error('Failed to generate HTML');
    }
    
    // Write to file
    await generator.writeFile('index.html', html);
    return true;
  } catch (error) {
    console.error('Static generation failed:', error);
    throw error; // Propagate error for proper handling
  }
} 