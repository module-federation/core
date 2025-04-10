import { defineConfig } from 'vite';
// import vue from '@vitejs/plugin-vue';
import path from 'path';
import dts from 'vite-plugin-dts';
// import react from '@vitejs/plugin-react';
import packageJson from './package.json';
import fs from 'fs';

const perDepsKeys = Object.keys(packageJson.peerDependencies);

export default defineConfig({
  plugins: [
    // 添加我们的自定义插件
    dts({
      rollupTypes: true,
      bundledPackages: [
        '@module-federation/bridge-shared',
        'react-error-boundary',
      ],
      // 自定义类型声明文件的输出路径
      afterBuild: () => {
        // 确保provider目录存在
        if (!fs.existsSync('dist/provider')) {
          fs.mkdirSync('dist/provider', { recursive: true });
        }

        // 复制src/provider/versions中的类型声明文件到dist/provider目录
        const srcDir = path.resolve(__dirname, 'dist/provider/versions');
        const destDir = path.resolve(__dirname, 'dist/provider');

        if (fs.existsSync(srcDir)) {
          // 读取srcDir中的所有文件
          const files = fs.readdirSync(srcDir);

          // 复制每个v*.d.ts文件到destDir
          files.forEach((file) => {
            if (file.match(/^v\d+\.d\.ts$/)) {
              const srcFile = path.join(srcDir, file);
              const destFile = path.join(destDir, file);

              // 读取源文件内容
              const content = fs.readFileSync(srcFile, 'utf8');

              // 写入目标文件
              fs.writeFileSync(destFile, content);

              console.log(`Copied ${srcFile} to ${destFile}`);
            }
          });
        } else {
          console.warn(`Source directory ${srcDir} does not exist.`);
        }
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        plugin: path.resolve(__dirname, 'src/provider/plugin.ts'),
        router: path.resolve(__dirname, 'src/router/default.tsx'),
        'router-v5': path.resolve(__dirname, 'src/router/v5.tsx'),
        'router-v6': path.resolve(__dirname, 'src/router/v6.tsx'),
        v16: path.resolve(__dirname, 'src/v16.ts'),
        v18: path.resolve(__dirname, 'src/v18.ts'),
        v19: path.resolve(__dirname, 'src/v19.ts'),
      },
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: [
        ...perDepsKeys,
        '@remix-run/router',
        /react-dom\/.*/,
        'react-router',
        'react-router-dom/',
        'react-router-dom/index.js',
        'react-router-dom/dist/index.js',
      ],
      output: {
        // 将共享chunk文件放在internal目录下，并使用更清晰的命名
        chunkFileNames: (chunkInfo) => {
          // 根据chunk的名称或内容确定一个更有意义的名称
          const name = chunkInfo.name;
          if (name.includes('context')) {
            return 'internal/context.[format].js';
          }
          if (name.includes('version-specific')) {
            return 'internal/version-specific.[format].js';
          }
          return 'internal/[name]-[hash].[format].js';
        },
      },
      plugins: [
        {
          name: 'modify-output-plugin',
          generateBundle(options, bundle) {
            for (const fileName in bundle) {
              const chunk = bundle[fileName];
              if (fileName.includes('router-v6') && chunk.type === 'chunk') {
                chunk.code = chunk.code.replace(
                  // Match 'react-router-dom/' followed by single quotes, double quotes, or backticks, replacing only 'react-router-dom/' to react-router-v6 dist file structure
                  /react-router-dom\/(?=[\'\"\`])/g,
                  'react-router-dom/dist/index.js',
                );
              }

              if (fileName.includes('router-v5') && chunk.type === 'chunk') {
                chunk.code = chunk.code.replace(
                  // Match 'react-router-dom/' followed by single quotes, double quotes, or backticks, replacing only 'react-router-dom/' to react-router-v5 dist file structure
                  /react-router-dom\/(?=[\'\"\`])/g,
                  'react-router-dom/index.js',
                );
              }
            }
          },
        },
      ],
    },
    minify: false,
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
