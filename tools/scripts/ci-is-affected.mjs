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

const affectedOutput = execSync(
  `npx nx show projects --affected --base=${base} --head=${head}`,
  { stdio: ['ignore', 'pipe', 'inherit'] },
)
  .toString()
  .trim();

const isAffected = affectedOutput
  ? affectedOutput
      .split('\n')
      .map((p) => p.trim())
      .some((project) => appNames.includes(project))
  : false;

if (isAffected) {
  console.log(`appNames: ${appNames} , conditions met, executing e2e CI.`);
  process.exit(0);
} else {
  console.log(`appNames: ${appNames} , conditions not met, skipping e2e CI.`);
  process.exit(1);
}
