import { $ } from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build';
import type {
  LoadTranslationFn,
  SpeakConfig,
  TranslationFn,
  SpeakLocale,
} from 'qwik-speak';

const LOCALES: Record<string, SpeakLocale> = {
  'en-US': { lang: 'en-US', currency: 'USD', timeZone: 'America/Los_Angeles' },
  'pt-BR': { lang: 'pt-BR', currency: 'BRL', timeZone: 'America/Sao_Paulo' },
};

export const config: SpeakConfig = {
  defaultLocale: LOCALES['en-US'],
  supportedLocales: Object.values(LOCALES),
  assets: [
    'app', // Translations shared by the pages
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
