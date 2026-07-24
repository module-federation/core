import { compile } from '@mdx-js/mdx';
import { compile as compileRspressMdx } from '@rspress/core/dist/node/mdx/processor.js';
import type { PluginDriver } from '@rspress/core/dist/node/PluginDriver.js';
import { describe, expect, it } from '@rstest/core';
import path from 'node:path';
import { pluginModuleFederation } from './plugin';
import {
  codeBlockTransformRuntimeModule,
  remarkCodeBlockTransform,
} from './remarkCodeBlockTransform';

describe('remarkCodeBlockTransform', () => {
  it('injects the runtime as the implicit MDX layout', async () => {
    const output = String(
      await compile('# Title\n\n```bash\nnpx mf -h\n```', {
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkCodeBlockTransform],
      }),
    );

    expect(output).toContain(
      `import MDXLayout from "${codeBlockTransformRuntimeModule}";`,
    );
    expect(output).toContain('_jsx(MDXLayout');
    expect(output).toContain('...props');
  });

  it('preserves an explicit user layout', async () => {
    const source = [
      'export default function CustomLayout({ children }) {',
      '  return <section>{children}</section>;',
      '}',
      '',
      '# Title',
    ].join('\n');
    const output = String(
      await compile(source, {
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkCodeBlockTransform],
      }),
    );

    expect(output).toContain('function CustomLayout');
    expect(output).not.toContain(codeBlockTransformRuntimeModule);
  });

  it('works in the real Rspress Markdown pipeline', async () => {
    const plugin = pluginModuleFederation(
      { name: 'rspress-code-block-test' },
      { transformCodeBlocks: true },
    );
    const docDirectory = process.cwd();
    const filepath = path.join(docDirectory, 'code-block-test.mdx');
    const pluginDriver = {
      getPlugins: () => [plugin],
    } as PluginDriver;

    const output = await compileRspressMdx({
      source: [
        '# Commands',
        '',
        'Other content.',
        '',
        '```bash title=cli wrapCode lineNumbers',
        'npx mf -h',
        '```',
      ].join('\n'),
      filepath,
      docDirectory,
      config: { markdown: {} },
      routeService: null,
      pluginDriver,
    });

    expect(output).toContain(
      `import MDXLayout from "${codeBlockTransformRuntimeModule}";`,
    );
    expect(output).toContain('className: "shiki css-variables"');
    expect(output).toContain('lang: "bash"');
    expect(output).toContain('title: "cli"');
    expect(output).toContain('lineNumbers: true');
    expect(output).toContain('wrapCode: true');
    expect(output).toContain('"Other content."');
  });
});
