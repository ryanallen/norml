// Index page logic
export function getPageContent() {
  return {
    title: 'MongoDB Status',
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