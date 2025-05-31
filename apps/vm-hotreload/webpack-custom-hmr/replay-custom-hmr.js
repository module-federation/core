// replay-custom-hmr.js
// This script now simply starts the application from the 'dist' directory.
// The application (src/index.js) itself will orchestrate its sequence of custom HMR updates.

console.log(
  '▶️ Starting application with internally orchestrated HMR updates (via replay-custom-hmr.js)...',
);

// Ensure the path is relative to where this script is run from (apps/vm-hotreload/webpack-custom-hmr)
// The application bundle is expected to be in ./dist/index.js relative to this script.
try {
  require('./dist/index.js');
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND' && e.message.includes('./dist/index.js')) {
    console.error('❌ Error: Application bundle ./dist/index.js not found.');
    console.error(
      "   Please ensure the project is built first (e.g., using 'pnpm run build' in this directory).",
    );
  } else {
    console.error('❌ Error loading application:', e);
  }
  process.exit(1);
}

console.log(
  '🏁 Application (potentially) finished or HMR demo sequence completed via replay-custom-hmr.js.',
);
