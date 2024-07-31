import path from 'path';
import { rmSync } from 'fs';

const TEMP_TS_CONFIG_DIR = path.resolve(
  __dirname,
  '../node_modules/.federation',
);
try {
  rmSync(TEMP_TS_CONFIG_DIR, { recursive: true });
} catch (err) {
  // noop
}
const TEMP_DIST = path.resolve(__dirname, '../dist-test');
try {
  rmSync(TEMP_DIST, { recursive: true });
} catch (err) {
  // noop
}
