const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, 'dist');
const appBundlePath = path.join(distDir, 'index.js');

console.log('🚀 Starting programmatic custom HMR demo...');

async function runProgrammaticHMRDemo() {
  if (!fs.existsSync(distDir) || !fs.existsSync(appBundlePath)) {
    console.error(
      `Error: dist directory or ${appBundlePath} not found. Build the project first.`,
    );
    process.exit(1);
  }

  // Load the application bundle (this will start the demo and trigger HMR updates programmatically)
  console.log(`📦 Loading application from ${appBundlePath}...`);
  require(appBundlePath); // Loads src/index.js from the bundle
  console.log('  ✅ Application loaded and demo started.');
  console.log(
    '  🎯 The application will now trigger HMR updates programmatically!',
  );
  console.log('  📺 Watch the console for HMR update messages...');

  // Wait for the demo to complete all 3 iterations
  // Each iteration takes about 1.5 seconds, so we wait 8 seconds to be safe
  await new Promise((resolve) => setTimeout(resolve, 28000));

  console.log(
    '\n🏁 Programmatic HMR demo script finished. All iterations completed.',
  );
}

runProgrammaticHMRDemo().catch((err) => {
  console.error('🔥 Demo script failed:', err);
  process.exit(1);
});
