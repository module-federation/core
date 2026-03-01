import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function findJestConfigs(dir: string, base = ''): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = base ? `${base}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (
          entry.name !== 'node_modules' &&
          entry.name !== 'dist' &&
          entry.name !== '.git' &&
          !entry.name.startsWith('.')
        ) {
          results.push(...findJestConfigs(fullPath, relPath));
        }
      } else if (
        entry.isFile() &&
        /^jest\.config\.(ts|js|mjs|cjs)$/.test(entry.name)
      ) {
        results.push(join(dir, entry.name));
      }
    }
  } catch {
    // ignore
  }
  return results;
}

const projects = findJestConfigs(join(__dirname, 'packages'))
  .concat(findJestConfigs(join(__dirname, 'apps')))
  .concat(findJestConfigs(join(__dirname, 'tools')))
  .filter((p) => p !== __filename);

export default {
  projects,
};
