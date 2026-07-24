import { MDXProvider, useMDXComponents } from '@mdx-js/react';
import React, {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';

export type CodeBlockInfo = {
  code: string;
  lang: string;
  title?: string;
};

export type CodeBlockTransformResult =
  | string
  | {
      code: string;
      lang?: string;
    }
  | null
  | undefined;

export type CodeBlockTransformer = (
  block: CodeBlockInfo,
) => CodeBlockTransformResult;

export type CodeBlockReplacement = readonly [from: string | RegExp, to: string];

export type TransformCodeBlockOptions = {
  /**
   * Ordered replacements applied to every fenced code block.
   */
  replace: readonly CodeBlockReplacement[];
  /**
   * Limit replacements to selected code blocks.
   */
  filter?: (block: CodeBlockInfo) => boolean;
  /**
   * Optionally update the language after replacements have been applied.
   */
  lang?:
    | string
    | ((block: CodeBlockInfo, original: CodeBlockInfo) => string | undefined);
};

/**
 * Create a code-block transformer from replacement rules.
 *
 * @example
 * ```tsx
 * const replaceCliName = transformCodeBlock({
 *   replace: [[/\bmf\b/g, 'vmok']],
 * });
 *
 * <RemoteDoc transformCodeBlock={replaceCliName} />
 * ```
 */
export function transformCodeBlock({
  replace,
  filter,
  lang,
}: TransformCodeBlockOptions): CodeBlockTransformer {
  return (original) => {
    if (filter && !filter(original)) {
      return undefined;
    }

    let code = original.code;
    for (const [from, to] of replace) {
      code =
        typeof from === 'string'
          ? code.split(from).join(to)
          : code.replace(from, to);
    }

    const transformed = {
      ...original,
      code,
    };
    const nextLang =
      typeof lang === 'function' ? lang(transformed, original) : lang;
    const resolvedLang = nextLang ?? original.lang;

    if (code === original.code && resolvedLang === original.lang) {
      return undefined;
    }

    return {
      code,
      lang: resolvedLang,
    };
  };
}

type CodeBlockTransformLayoutProps = {
  children?: ReactNode;
  transformCodeBlock?: CodeBlockTransformer | null;
};

type TransformContextValue = {
  transformer?: CodeBlockTransformer;
  pre: React.ElementType;
};

type TransformPreProps = React.ComponentPropsWithoutRef<'pre'> & {
  lang?: string;
  title?: string;
  wrapCode?: boolean;
  lineNumbers?: boolean;
  fold?: boolean;
  height?: number;
};

const CodeBlockTransformContext = createContext<TransformContextValue | null>(
  null,
);

function getTextContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (!node) {
    return '';
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join('');
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getTextContent(node.props.children);
  }
  let text = '';
  Children.forEach(node, (child) => {
    text += getTextContent(child);
  });
  return text;
}

function isRspressCodeBlock(className: unknown, lang: unknown): boolean {
  return (
    typeof className === 'string' &&
    className.split(/\s+/).includes('shiki') &&
    typeof lang === 'string'
  );
}

function replaceHighlightedText(
  node: ReactNode,
  originalCode: string,
  transformedCode: string,
): ReactNode {
  let prefixLength = 0;
  while (
    prefixLength < originalCode.length &&
    prefixLength < transformedCode.length &&
    originalCode[prefixLength] === transformedCode[prefixLength]
  ) {
    prefixLength++;
  }

  let suffixLength = 0;
  while (
    suffixLength < originalCode.length - prefixLength &&
    suffixLength < transformedCode.length - prefixLength &&
    originalCode[originalCode.length - suffixLength - 1] ===
      transformedCode[transformedCode.length - suffixLength - 1]
  ) {
    suffixLength++;
  }

  const oldSuffixStart = originalCode.length - suffixLength;
  const replacement = transformedCode.slice(
    prefixLength,
    transformedCode.length - suffixLength,
  );
  let offset = 0;
  let replacementInserted = false;

  const visit = (current: ReactNode): ReactNode => {
    if (typeof current === 'string' || typeof current === 'number') {
      const text = String(current);
      const start = offset;
      const end = start + text.length;
      offset = end;

      if (end <= prefixLength || start >= oldSuffixStart) {
        return text;
      }

      let next = '';
      if (start < prefixLength) {
        next += text.slice(0, prefixLength - start);
      }
      if (!replacementInserted) {
        next += replacement;
        replacementInserted = true;
      }
      if (end > oldSuffixStart) {
        next += text.slice(oldSuffixStart - start);
      }
      return next;
    }
    if (Array.isArray(current)) {
      return Children.map(current, visit);
    }
    if (isValidElement<{ children?: ReactNode }>(current)) {
      return cloneElement(current, undefined, visit(current.props.children));
    }
    return current;
  };

  const result = visit(node);
  return getTextContent(result) === transformedCode ? result : transformedCode;
}

function TransformedCodeBlock({
  OriginalPre,
  originalProps,
  originalCode,
  code,
  lang,
}: {
  OriginalPre: React.ElementType;
  originalProps: TransformPreProps;
  originalCode: string;
  code: string;
  lang: string;
}) {
  const { children, ...preProps } = originalProps;
  const codeElement = isValidElement<{ children?: ReactNode }>(children)
    ? cloneElement(
        children,
        undefined,
        replaceHighlightedText(children.props.children, originalCode, code),
      )
    : React.createElement('code', undefined, code);

  return (
    <OriginalPre {...preProps} lang={lang}>
      {codeElement}
    </OriginalPre>
  );
}

/**
 * Internal MDX layout injected by the Rspress plugin.
 */
export default function CodeBlockTransformLayout({
  children,
  transformCodeBlock: directTransformer,
}: CodeBlockTransformLayoutProps) {
  const inherited = useContext(CodeBlockTransformContext);
  const mdxComponents = useMDXComponents();

  // Nested MDX fragments inherit the parent document's provider. Avoid wrapping
  // the same code block more than once unless a nested document explicitly
  // supplies its own transformer.
  if (inherited && directTransformer === undefined) {
    return children;
  }

  const transformer =
    directTransformer === null
      ? undefined
      : (directTransformer ?? inherited?.transformer);
  const OriginalPre = inherited?.pre ?? mdxComponents.pre ?? 'pre';

  const components = useMemo(
    () => ({
      pre: (props: TransformPreProps) => {
        const { children: codeChildren, lang, title, className } = props;

        if (!transformer || !isRspressCodeBlock(className, lang)) {
          return <OriginalPre {...props} />;
        }

        const original: CodeBlockInfo = {
          code: getTextContent(codeChildren as ReactNode),
          lang: lang as string,
          title: typeof title === 'string' ? title : undefined,
        };
        const result = transformer(original);

        if (result == null) {
          return <OriginalPre {...props} />;
        }

        const code = typeof result === 'string' ? result : result.code;
        const transformedLang =
          typeof result === 'string'
            ? original.lang
            : (result.lang ?? original.lang);

        return (
          <TransformedCodeBlock
            OriginalPre={OriginalPre}
            originalProps={props}
            originalCode={original.code}
            code={code}
            lang={transformedLang}
          />
        );
      },
    }),
    [OriginalPre, transformer],
  );

  return (
    <CodeBlockTransformContext.Provider
      value={{
        transformer,
        pre: OriginalPre,
      }}
    >
      <MDXProvider components={components}>{children}</MDXProvider>
    </CodeBlockTransformContext.Provider>
  );
}
