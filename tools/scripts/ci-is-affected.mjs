import { execSync } from 'child_process';
import yargs from 'yargs';

let { appName, base, head } = yargs(process.argv).argv;
base = base || process.env.NX_BASE || 'origin/main';
head = head || process.env.NX_HEAD || 'HEAD';

if (!appName) {
  console.log('Could not find "appName" param.');
  process.exit(1);
}
const appNames = appName.split(',');

const affectedProjectsOutput = execSync(
  `npx nx show projects --affected --base=${base} --head=${head}`,
)
  .toString()
  .split('\n')
  .map((p) => p.trim())
  .filter(Boolean);

const isAffected = affectedProjectsOutput
  .map((p) => appNames.includes(p))
  .some((included) => included === true);

if (isAffected) {
  console.log(`appNames: ${appNames} , conditions met, executing e2e CI.`);
  process.exit(0);
} else {
  console.log(`appNames: ${appNames} , conditions not met, skipping e2e CI.`);
  process.exit(1);
}
