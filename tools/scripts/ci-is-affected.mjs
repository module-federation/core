import { execSync } from 'child_process';
import yargs from 'yargs';

let { appName, base, head } = yargs(process.argv).argv;
base = base || 'origin/main';
head = head || 'HEAD';

if (!appName) {
  console.log('Could not find "appName" param.');
  process.exit(1);
}
const appNames = appName.split(',');

const isAffected = execSync(`npx nx show projects --affected`)
  .toString()
  .split('\n')
  .map((p) => p.trim())
  .map((p) => appNames.includes(p))
  .some((included) => !!included)
  .toString();

if (isAffected) {
  console.log(`appNames: ${appNames} , conditions met, executing e2e CI.`);
  process.exit(0);
} else {
  console.log(`appNames: ${appNames} , conditions not met, skipping e2e CI.`);
  process.exit(1);
}
