import { execSync } from 'child_process';
import yargs from 'yargs';

const { appName, base, head } = yargs(process.argv).argv;

if (!appName) {
  console.log('Could not find "appName" param.');
  process.exit(1);
}
const appNames = appName
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);
const appNameSet = new Set(appNames);

const commandParts = ['npx nx show projects --affected'];
if (base) {
  commandParts.push(`--base=${base}`);
}
if (head) {
  commandParts.push(`--head=${head}`);
}

const affectedProjects = execSync(commandParts.join(' '))
  .toString()
  .split('\n')
  .map((p) => p.trim())
  .filter(Boolean);

const isAffected = affectedProjects.some((project) => appNameSet.has(project));

if (isAffected) {
  console.log(`appNames: ${appNames} , conditions met, executing e2e CI.`);
  process.exit(0);
} else {
  console.log(`appNames: ${appNames} , conditions not met, skipping e2e CI.`);
  process.exit(1);
}
