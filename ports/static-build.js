export async function generateStatic(content, config, presenter, generator) {
  try {
    // Replace API base URL in content
    content.features = content.features.map(feature => ({
      ...feature,
      endpoint: feature.endpoint.startsWith('/api') 
        ? `${config.apiBase}${feature.endpoint}`
        : feature.endpoint
    }));

    // Generate HTML
    const html = presenter.format(content);
    
    // Write to file
    await generator.writeFile('index.html', html);
    return true;
  } catch (error) {
    console.error('Static generation failed:', error);
    return false;
  }
} 