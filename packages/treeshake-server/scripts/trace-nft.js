const fs = require('node:fs');
const path = require('node:path');
const { nodeFileTrace } = require('@vercel/nft');

async function main() {
  const repoRoot = path.resolve(__dirname, '../../..');
  const serverRoot = path.resolve(__dirname, '..');
  const entry = path.join(serverRoot, 'dist', 'server.js');
  const outputDir = path.join(repoRoot, 'output');

  if (!fs.existsSync(entry)) {
    throw new Error(`Missing build output: ${entry}`);
  }

  const { fileList } = await nodeFileTrace([entry], {
    base: serverRoot,
    processCwd: serverRoot,
  });

  fs.mkdirSync(outputDir, { recursive: true });

  for (const file of fileList) {
    const src = path.join(serverRoot, file);
    let destRel = file;
    if (destRel.startsWith('dist/')) {
      destRel = destRel.slice('dist/'.length);
    }
    const dest = path.join(outputDir, destRel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    const stat = fs.lstatSync(src);
    if (stat.isSymbolicLink()) {
      const link = fs.readlinkSync(src);
      try {
        fs.unlinkSync(dest);
      } catch {}
      fs.symlinkSync(link, dest);
    } else if (stat.isFile()) {
      fs.copyFileSync(src, dest);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
