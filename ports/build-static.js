import { getPageContent } from '../logic/index.js';
import { generateStatic } from './static-build.js';
import { StaticGeneratorAdapter } from '../adapters/static-generator.js';
import { IndexPresenter } from '../presenters/index.js';

const config = {
  apiBase: process.env.API_BASE || 'https://norml-459701.uc.r.appspot.com'
};

async function build() {
  try {
    const content = getPageContent();
    const generator = new StaticGeneratorAdapter();
    const presenter = new IndexPresenter();
    
    await generateStatic(content, config, presenter, generator);
    console.log('✅ Static HTML generated successfully');
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