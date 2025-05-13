// Static build logic
export function prepareStaticContent(content, config) {
  return {
    ...content,
    features: content.features.map(f => ({
      ...f,
      endpoint: `${config.apiBase}${f.endpoint}`
    }))
  };
} 