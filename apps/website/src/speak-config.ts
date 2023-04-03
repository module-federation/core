import { $ } from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build';
import {
  LoadTranslationFn,
  SpeakConfig,
  TranslationFn,
  SpeakLocale,
  useSpeakContext,
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
    'app', // Translations shared by the pages,
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

export const loadTranslation$: LoadTranslationFn = $(
  async (lang: string, asset: string, origin?: string) => {
    let url = '';
    // Absolute urls on server
    if (isServer && origin) {
      url = origin;
    }
    url += `/i18n/${lang}/${asset}.json`;

    const response = await fetch(url);

    if (response.ok) {
      return response.json();
    } else if (response.status === 404) {
      console.warn(`loadTranslation$: ${url} not found`);
    }
  }
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
