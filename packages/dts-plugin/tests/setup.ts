import { rmSync } from 'fs';
import path from 'path';

const TEMP_TS_CONFIG_DIR = path.resolve(__dirname, 'node_modules/.federation');
try {
  rmSync(TEMP_TS_CONFIG_DIR, { recursive: true });
} catch (err) {
  // noop
}
