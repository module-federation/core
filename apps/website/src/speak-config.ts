import { SpeakConfig, SpeakLocale, SpeakState } from 'qwik-speak';
export const LOCALES: Record<string, SpeakLocale> = {
  'en-US': { lang: 'en-US', currency: 'USD', timeZone: 'America/Los_Angeles' },
  'pt-BR': { lang: 'pt-BR', currency: 'BRL', timeZone: 'America/Sao_Paulo' },
  'zh-CN': { lang: 'zh-CN', currency: 'CNY', timeZone: 'Asia/Shanghai' },
};

export const config: SpeakConfig = {
  defaultLocale: LOCALES['en-US'],
  supportedLocales: Object.values(LOCALES),
  assets: [
    'app',
    'contact',
    'banner',
    'discord',
    'doc-summary',
    'evolving',
    'explore',
    'footer',
    'hero',
    'medusa',
    'navbar',
    'showcase',
    'sponsor',
    'subscribe',
    'showcase-page',
  ],
};

export const localizedUrl = (url: string, speakState: SpeakState) => {
  const starturl = url.startsWith('/') ? url : `/${url}`;
  const endurl = starturl.endsWith('/') ? starturl : `${starturl}/`;

  const handledLang =
    config.defaultLocale.lang === speakState.locale.lang
      ? ''
      : `/${speakState.locale.lang}`;
  const finalUrl = `${handledLang}${endurl}`;

  const isAnchor = finalUrl.includes('/#');

  if (isAnchor) {
    return finalUrl.slice(0, -1);
  }

  return finalUrl;
};
