import {defineConfig} from 'tsup'

const SUPPORTED_BUNDLERS = ['esbuild', 'rollup', 'vite', 'webpack', 'rspack']

export default defineConfig({
    entry: [
        'src/index.ts',
        ...SUPPORTED_BUNDLERS.map(bundler => `src/${bundler}.ts`)
    ],
    dts: true,
    splitting: true,
    clean: true,
    minify: true,
    format: ['cjs', 'esm']
})