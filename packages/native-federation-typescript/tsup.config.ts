import {defineConfig} from 'tsup'
import { join } from 'path'

const SUPPORTED_BUNDLERS = ['esbuild', 'rollup', 'vite', 'webpack', 'rspack']

export default defineConfig({
    entry: [
        'src/index.ts',
        ...SUPPORTED_BUNDLERS.map(bundler => join(__dirname, 'src', `${bundler}.ts`))
    ],
    dts: true,
    splitting: true,
    clean: true,
    minify: true,
    format: ['cjs', 'esm'],
    outDir: 'dist/packages/native-federation-typescript'
})
