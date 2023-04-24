// __tests__/build.test.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Next.js build output', () => {
  beforeAll(() => {
    // Run the build programmatically
    // console.log('buildOutputDir', buildOutputDir);
    // execSync('nx build', { stdio: 'inherit', cwd: '../../' });
    //execSync("cd " + JSON.stringify(__dirname) +'; yarn build', { stdio: 'inherit', cwd: __dirname });
  });
  describe('client', () => {
    const buildOutputDir = path.join(
      __dirname,
      '../../',
      'dist/apps/3000-home/.next/static/chunks'
    );
    it('remoteEntry.js', () => {
      const buildOutput = findFileInDirectory('remoteEntry', buildOutputDir);
      expect(buildOutput).toMatchSnapshot();
    });
    it('partial remote', () => {
      const buildOutput = findFileInDirectory('home_app', buildOutputDir);
      expect(buildOutput).toMatchSnapshot();
    });
    it('webpack-runtime', () => {
      const buildOutput = findFileInDirectory('webpack-', buildOutputDir);
      expect(buildOutput).toMatchSnapshot();
    });
  });
  xdescribe('server', () => {
    const buildOutputDir = path.join(
      __dirname,
      '../../',
      'dist/apps/3000-home/.next/server'
    );
    it('remoteEntry.js', () => {
      const buildOutput = findFileInDirectory('remoteEntry', buildOutputDir);
      expect(buildOutput).toMatchSnapshot();
    });
    it('partial remote', () => {
      const buildOutput = findFileInDirectory('home_app', buildOutputDir);
      expect(buildOutput).toMatchSnapshot();
    });
    it('webpack-runtime', () => {
      const buildOutput = findFileInDirectory('webpack-', buildOutputDir);
      expect(buildOutput).toMatchSnapshot();
    });
  });
});

function findFileInDirectory(
  filename: string,
  directory: string
): string | null {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    const fileStat = fs.statSync(filePath);
    if (fileStat.isDirectory()) {
      const result = findFileInDirectory(filename, filePath);
      if (result) {
        return result;
      }
    } else if (file.startsWith(filename) && file.endsWith('.js')) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  }
  return null;
}
