export async function format(code: string): Promise<string> {
  try {
    const prettier = await import('prettier');
    // @ts-expect-error esm entry
    const parserBabel = (await import('prettier/esm/parser-babel.mjs')).default;
    const pluginEstree = (await import('prettier/plugins/estree')).default;
    return prettier.format(code, {
      parser: 'babel',
      plugins: [parserBabel, pluginEstree],
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error formatting code:', error);
    return code;
  }
}
