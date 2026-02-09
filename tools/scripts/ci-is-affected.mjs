import { execSync } from 'child_process';
import yargs from 'yargs';

let { appName, base, head } = yargs(process.argv).argv;

const hasGitRef = (ref) => {
  if (!ref) {
    return false;
  }
  try {
    execSync(`git rev-parse --verify --quiet "${ref}^{commit}"`, {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
};

const fallbackBase =
  process.env.NX_BASE ||
  (hasGitRef('origin/main')
    ? 'origin/main'
    : hasGitRef('main')
      ? 'main'
      : hasGitRef('HEAD~1')
        ? 'HEAD~1'
        : 'HEAD');
const fallbackHead = process.env.NX_HEAD || 'HEAD';

base = hasGitRef(base) ? base : fallbackBase;
head = hasGitRef(head) ? head : fallbackHead;

if (!appName) {
  console.log('Could not find "appName" param.');
  process.exit(1);
}
const appNames = appName.split(',');

const isAffected = execSync(
  `npx nx show projects --affected --base=${base} --head=${head}`,
)
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
