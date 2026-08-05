import { MDXProvider, useMDXComponents } from '@mdx-js/react';
import { describe, expect, it } from '@rstest/core';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CodeBlockTransformLayout, { transformCodeBlock } from './index';

function HighlightedDocument() {
  const components = useMDXComponents();
  const Pre = components.pre ?? 'pre';
  const Code = components.code ?? 'code';

  return (
    <>
      <h2>Commands</h2>
      <p>Run this command:</p>
      <Pre className="shiki css-variables" lang="bash">
        <Code>
          <span className="line">
            <span>npx</span>
            <span> mf</span>
            <span> -h</span>
          </span>
        </Code>
      </Pre>
      <pre>hand-written pre</pre>
    </>
  );
}

describe('code block transform runtime', () => {
  it('replaces fenced code without changing surrounding content', () => {
    const transformer = transformCodeBlock({
      replace: [[/\bmf\b/g, 'vmok']],
    });
    const html = renderToStaticMarkup(
      <MDXProvider components={{ pre: 'pre', code: 'code' }}>
        <CodeBlockTransformLayout transformCodeBlock={transformer}>
          <HighlightedDocument />
        </CodeBlockTransformLayout>
      </MDXProvider>,
    );

    expect(html).toContain('<h2>Commands</h2>');
    expect(html).toContain('<p>Run this command:</p>');
    expect(html).toContain(
      '<span>npx</span><span> vmok</span><span> -h</span>',
    );
    expect(html).toContain('lang="bash"');
    expect(html).toContain('<pre>hand-written pre</pre>');
  });

  it('keeps the original highlighted block when no replacement matches', () => {
    const transformer = transformCodeBlock({
      replace: [['webpack', 'rspack']],
    });
    const html = renderToStaticMarkup(
      <MDXProvider components={{ pre: 'pre', code: 'code' }}>
        <CodeBlockTransformLayout transformCodeBlock={transformer}>
          <HighlightedDocument />
        </CodeBlockTransformLayout>
      </MDXProvider>,
    );

    expect(html).toContain('<span>npx</span><span> mf</span><span> -h</span>');
  });

  it('allows changing the language from the transformed content', () => {
    const transformer = transformCodeBlock({
      replace: [[/\bmf\b/g, 'vmok']],
      lang: ({ code, lang }) => (code.startsWith('npx vmok') ? 'text' : lang),
    });
    const html = renderToStaticMarkup(
      <MDXProvider components={{ pre: 'pre', code: 'code' }}>
        <CodeBlockTransformLayout transformCodeBlock={transformer}>
          <HighlightedDocument />
        </CodeBlockTransformLayout>
      </MDXProvider>,
    );

    expect(html).toContain(
      '<span>npx</span><span> vmok</span><span> -h</span>',
    );
    expect(html).toContain('lang="text"');
  });

  it('inherits the transformer through nested MDX layouts', () => {
    const transformer = transformCodeBlock({
      replace: [[/\bmf\b/g, 'vmok']],
    });
    const html = renderToStaticMarkup(
      <MDXProvider components={{ pre: 'pre', code: 'code' }}>
        <CodeBlockTransformLayout transformCodeBlock={transformer}>
          <CodeBlockTransformLayout>
            <HighlightedDocument />
          </CodeBlockTransformLayout>
        </CodeBlockTransformLayout>
      </MDXProvider>,
    );

    expect(html.match(/ vmok/g)).toHaveLength(1);
  });
});
