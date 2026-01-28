import { rmSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMP_TS_CONFIG_DIR = resolve(__dirname, '../node_modules/.federation');
try {
  rmSync(TEMP_TS_CONFIG_DIR, { recursive: true });
} catch (err) {
  // noop
}
const TEMP_DIST = resolve(__dirname, '../dist-test');
try {
  rmSync(TEMP_DIST, { recursive: true });
} catch (err) {
  // noop
}
