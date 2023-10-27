import { server$ } from '@builder.io/qwik-city';
import type { LoadTranslationFn, Translation, TranslationFn } from 'qwik-speak';

/**
 * Translation files are lazy-loaded via dynamic import and will be split into separate chunks during build.
 * Keys must be valid variable names
 */
const translationData = import.meta.glob('/src/i18n/**/*.json', {
  as: 'raw',
  eager: true,
});

const loadTranslation$: LoadTranslationFn = server$(
    (lang: string, asset: string) =>
        JSON.parse(translationData[`/src/i18n/${lang}/${asset}.json`]),
);

export const translationFn: TranslationFn = {
  loadTranslation$: loadTranslation$,
};
