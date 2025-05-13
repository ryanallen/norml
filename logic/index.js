// Index page logic
export function getPageContent() {
  return {
    title: 'Database Status',
    features: [
      {
        name: 'Database Status',
        endpoint: '/db'
      },
      {
        name: 'Version',
        endpoint: '/version'
      }
    ]
  };
} 