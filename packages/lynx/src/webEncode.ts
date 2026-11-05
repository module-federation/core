import type { TasmJSONInfo } from '@lynx-js/web-core/encode';

interface ExternalBundleSection {
  content: unknown;
  encoding?: string;
}

interface ExternalBundleEncodeOptions {
  compilerOptions?: Record<string, unknown>;
  customSections?: Record<string, ExternalBundleSection>;
  sourceContent?: { appType?: string };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getEncodeOptions = (value: unknown): ExternalBundleEncodeOptions => {
  if (!isRecord(value)) {
    throw new TypeError('Expected Lynx external-bundle encode options.');
  }
  return value as ExternalBundleEncodeOptions;
};

const getJavaScript = (name: string, content: unknown): string => {
  if (typeof content !== 'string') {
    throw new TypeError(`Lynx JavaScript section "${name}" must be a string.`);
  }
  return content;
};

export const getLynxWebEncodeMode = () => async (value: unknown) => {
  const options = getEncodeOptions(value);
  const styleInfo: TasmJSONInfo['styleInfo'] = {};
  const manifest: TasmJSONInfo['manifest'] = {};
  const lepusCode: TasmJSONInfo['lepusCode'] = {};
  const customSections: TasmJSONInfo['customSections'] = {};
  let cssId = 0;

  for (const [name, section] of Object.entries(options.customSections ?? {})) {
    if (section.encoding === 'CSS') {
      const ruleList = isRecord(section.content)
        ? section.content.ruleList
        : undefined;
      styleInfo[String(cssId++)] = Array.isArray(ruleList) ? ruleList : [];
    } else if (section.encoding === 'JsBytecode') {
      lepusCode[name] = getJavaScript(name, section.content);
    } else if (typeof section.content === 'string') {
      manifest[`/${name}`] = section.content;
    } else {
      customSections[name] = {
        content: section.content as Record<string, unknown>,
      };
    }
  }

  const { encode } = await import('@lynx-js/web-core/encode');
  return {
    buffer: Buffer.from(
      encode({
        appType: options.sourceContent?.appType ?? 'DynamicComponent',
        cardType: 'react',
        customSections,
        elementTemplates: {},
        lepusCode,
        manifest,
        pageConfig: options.compilerOptions ?? {},
        styleInfo,
      }),
    ),
  };
};
