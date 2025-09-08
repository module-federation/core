import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');

// Clean dist directory
if (existsSync('dist')) {
  rmSync('dist', { recursive: true });
}

// Build command
const buildCommand = `tsc ${isWatch ? '--watch' : ''}`;

try {
  console.log('Building rspeedy-core-plugin...');
  execSync(buildCommand, { stdio: 'inherit' });
  if (!isWatch) {
    console.log('Build completed successfully!');
  }
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}