import { server$ } from '@builder.io/qwik-city';
import {
  LoadTranslationFn,
  SpeakConfig,
  TranslationFn,
  SpeakLocale,
  SpeakState,
} from 'qwik-speak';

export const LOCALES: Record<string, SpeakLocale> = {
  'en-US': { lang: 'en-US', currency: 'USD', timeZone: 'America/Los_Angeles' },
  'pt-BR': { lang: 'pt-BR', currency: 'BRL', timeZone: 'America/Sao_Paulo' },
};

export const config: SpeakConfig = {
  defaultLocale: LOCALES['en-US'],
  supportedLocales: Object.values(LOCALES),
  assets: [
    'app',
    'contact',
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

const translationData = import.meta.glob('/public/i18n/**/*.json');

const loadTranslation$: LoadTranslationFn = server$(async (lang: string, asset: string) =>
  await translationData[`/public/i18n/${lang}/${asset}.json`]()
);

export const translationFn: TranslationFn = {
  loadTranslation$: loadTranslation$,
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
