import { execSync } from 'child_process';
import yargs from 'yargs';

let { appName, base, head } = yargs(process.argv).argv;
base = base || 'origin/master';
head = head || 'HEAD';

if (!appName) {
  console.log('Could not find "appName" param.');
  process.exit(1);
}

const appNames = appName.split(',');

const isAffected = execSync(
  `npx nx print-affected --type=app --select=projects --base=${base} --head=${head}`,
)
  .toString()
  .split(',')
  .map((p) => p.trim())
  .map((p) => appNames.includes(p))
  .some((included) => !!included)
  .toString();

console.log(isAffected);
