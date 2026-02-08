import { execSync } from 'child_process';
import { appendFileSync } from 'node:fs';
import yargs from 'yargs';

let { appName, base, head } = yargs(process.argv).argv;
base = base || process.env.NX_BASE || 'origin/main';
head = head || process.env.NX_HEAD || 'HEAD';

if (!appName) {
  console.log('Could not find "appName" param.');
  process.exit(1);
}
const appNames = appName
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

const command = `npx nx show projects --affected --base=${base} --head=${head}`;
let affectedProjects = [];
try {
  affectedProjects = execSync(command, { encoding: 'utf-8' })
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);
} catch (error) {
  console.error('[ci-is-affected] Failed to determine affected projects.');
  console.error(error?.message ?? error);
  process.exit(1);
}

const isAffected = affectedProjects.some((project) =>
  appNames.includes(project),
);
const outputValue = isAffected ? 'true' : 'false';

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `run-e2e=${outputValue}\n`);
}

if (isAffected) {
  console.log(`appNames: ${appNames} , conditions met, executing e2e CI.`);
} else {
  console.log(`appNames: ${appNames} , conditions not met, skipping e2e CI.`);
}

process.exit(0);
