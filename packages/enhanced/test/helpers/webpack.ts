//@ts-ignore
import webpack from 'webpack';
import { Volume } from 'memfs';
import path from 'path';

// Create a virtual file system
export const createVirtualFs = () => {
  const vol = new Volume();

  // Initialize with a basic directory structure
  vol.mkdirSync('/src', { recursive: true });
  vol.mkdirSync('/dist', { recursive: true });

  return vol;
};

// Helper to write files to virtual fs
export const writeFiles = (vol: Volume, files: Record<string, string>) => {
  for (const [filePath, content] of Object.entries(files)) {
    const dir = path.dirname(filePath);
    vol.mkdirSync(dir, { recursive: true });
    vol.writeFileSync(filePath, content);
  }
};

// Helper to run webpack compilation
export const runWebpack = async (
  config: webpack.Configuration,
  vol: Volume,
) => {
  const compiler = webpack({
    ...config,
    mode: 'development',
    context: '/',
    output: {
      path: '/dist',
      filename: '[name].js',
      ...config.output,
    },
  });

  // Use memfs for input/output
  compiler.inputFileSystem = vol as any;
  compiler.outputFileSystem = vol as any;

  return new Promise<webpack.Stats>((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      if (!stats) {
        reject(new Error('No stats available'));
        return;
      }
      if (stats.hasErrors()) {
        reject(new Error(stats.toString()));
        return;
      }
      resolve(stats);
    });
  });
};
