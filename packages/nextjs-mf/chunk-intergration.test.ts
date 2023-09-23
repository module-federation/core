// __tests__/build.test.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

xdescribe('Next.js build output', () => {
  beforeAll(() => {
    // Run the build programmatically
    // console.log('buildOutputDir', buildOutputDir);
    // execSync('nx build', { stdio: 'inherit', cwd: '../../' });
    //execSync("cd " + JSON.stringify(__dirname) +'; yarn build', { stdio: 'inherit', cwd: __dirname });
  });
  afterEach(() => {
    if (global.self) {
      //@ts-ignore
      delete global.self.webpackChunkhome_app;
    }
  });
  describe('client', () => {
    const buildOutputDir = path.join(
      __dirname,
      '../../',
      'dist/apps/3000-home/.next/static/chunks',
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
      const buildOutput = findFileInDirectory('webpack', buildOutputDir);
      expect(buildOutput).toMatchSnapshot();
    });
    describe('modules', () => {
      it('main chunk should have react', () => {
        const buildOutput = findModulesInChunk('main', buildOutputDir);
        const hasReact = buildOutput?.some((module) =>
          module.includes('node_modules/react/'),
        );
        expect(hasReact).toBe(true);
      });
      it('main chunk should have delegate hoist', () => {
        const buildOutput = findModulesInChunk('main', buildOutputDir);
        const hasReact = buildOutput?.some((module) =>
          module.includes('internal-delegate-hoist'),
        );
        expect(hasReact).toBe(true);
      });

      it('main chunk should have styled-jsx', () => {
        const buildOutput = findModulesInChunk('main', buildOutputDir);
        const hasReact = buildOutput?.some((module) =>
          module.includes('node_modules/styled-jsx/'),
        );
        expect(hasReact).toBe(true);
      });
      it('main chunk should NOT have delegate modules', () => {
        const buildOutput = findModulesInChunk('main', buildOutputDir);
        const hasReact = buildOutput?.some((module) =>
          module.includes('remote='),
        );
        expect(hasReact).toBe(false);
      });

      it('main chunk', () => {
        const buildOutput = findModulesInChunk('main', buildOutputDir);
        expect(buildOutput).toMatchSnapshot();
      });
    });
  });
  describe('server', () => {
    const buildOutputDir = path.join(
      __dirname,
      '../../',
      'dist/apps/3000-home/.next/server',
    );
    it('remoteEntry.js', () => {
      const buildOutput = findFileInDirectory('remoteEntry', buildOutputDir);
      expect(buildOutput).toMatchSnapshot();
    });
    xit('partial remote', () => {
      const buildOutput = findFileInDirectory('home_app', buildOutputDir);
      expect(buildOutput).toMatchSnapshot();
    });
    it('webpack-runtime', () => {
      const buildOutput = findFileInDirectory('webpack-', buildOutputDir);
      expect(buildOutput).toMatchSnapshot();
    });
    describe('modules', () => {
      xit('page partial doesnt contain react', () => {
        const buildOutput = findModulesInChunk('pages_', buildOutputDir);
        const hasReact = buildOutput?.some(
          (module) =>
            module.includes('node_modules/react/') || module === 'react',
        );
        expect(hasReact).toBe(false);
      });

      xit('main chunk', () => {
        const buildOutput = findModulesInChunk('main-', buildOutputDir);
        expect(buildOutput).toMatchSnapshot();
      });

      it('doesnt have shared modules in main chunks', () => {
        // @ant-design
        const buildOutput = findModulesInChunk('pages__app', buildOutputDir);
        const hasReact = buildOutput?.some(
          (module) => module.includes('/@ant-design/') || module === 'react',
        );
        expect(hasReact).toBe(false);
      });
    });
  });
});

function findFileInDirectory(
  filename: string,
  directory: string,
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

function findModulesInChunk(filename: string, directory: string) {
  //@ts-ignore
  global.self = { webpackChunkhome_app: [] };
  const chunk = findFileInDirectory(filename, directory);
  if (chunk) {
    const evaledChunk = eval(chunk);
    if (typeof evaledChunk === 'object') {
      return Object.keys(evaledChunk);
    }
    console.log(evaledChunk);
    //@ts-ignore
    const moduleMaps = globalThis.self['webpackChunkhome_app'][0][1];

    return Object.keys(moduleMaps);
  }
  return null;
}
