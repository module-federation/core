const path = require('path');
const fs = require('fs');

console.log('Starting manual HMR replay...');

// 1. Start the main bundle (this will initialize the HMR runtime)
require('./index.js');

// 2. List all hot-update.json files in order (edit as needed)
const updates = [
  { hash: '7c2669c0c77598a9d5e6' },
  { hash: '9d3d559c9ff6978a12fd' },
  { hash: 'd505a8316cbebb1e5112' },
  { hash: 'd9d5fa2333e1ff9965b7' },
  { hash: 'custom' }, // Custom update for src/index.js
];

// 3. For each update, log the intended replay step
async function replay() {
  for (const { hash } of updates) {
    // Copy JSON and JS files into place
    fs.copyFileSync(
      path.join(__dirname, `all-updates/index.${hash}.hot-update.json`),
      path.join(__dirname, `index.${hash}.hot-update.json`),
    );
    fs.copyFileSync(
      path.join(__dirname, `all-updates/index.${hash}.hot-update.js`),
      path.join(__dirname, `index.${hash}.hot-update.js`),
    );
    console.log(`[REPLAY] Update ${hash} injected`);
    await new Promise((resolve) => setTimeout(resolve, 1200)); // Wait for poller
    // Optionally, remove the files after poller picks them up
    // fs.unlinkSync(path.join(__dirname, `index.${hash}.hot-update.json`));
    // fs.unlinkSync(path.join(__dirname, `index.${hash}.hot-update.js`));
  }
  console.log('Replay complete.');
}

replay();
