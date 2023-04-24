// __tests__/build.test.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Next.js build output', () => {
  const buildOutputDir = path.join(
    __dirname,
    '../../',
    'dist/apps/3000-home/.next'
  );

  beforeAll(() => {
    // Run the build programmatically
    // console.log('buildOutputDir', buildOutputDir);
    // execSync('nx build', { stdio: 'inherit', cwd: '../../' });
    //execSync("cd " + JSON.stringify(__dirname) +'; yarn build', { stdio: 'inherit', cwd: __dirname });
  });

  xit('matches the snapshot', () => {
    const buildOutput = getBuildOutput(buildOutputDir);
    expect(buildOutput).toMatchSnapshot();
  });
});

function getBuildOutput(dir: string): Record<string, string> {
  const output: Record<string, string> = {};

  const files = fs.readdirSync(dir, { withFileTypes: true });

  files.forEach((file) => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      // @ts-ignore
      output[file.name] = getBuildOutput(filePath);
    } else {
      if (
        (file.name.startsWith('webpack-') ||
          file.name.startsWith('home') ||
          file.name.startsWith('remoteEntry')) &&
        file.name.endsWith('.js')
      ) {
        console.log(file.name);
      } else {
        return;
      }
      output[file.name] = fs.readFileSync(filePath, 'utf8');
    }
  });

  return output;
}
