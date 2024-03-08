import { LoadTranslationFn, TranslationFn } from 'qwik-speak';
import { server$ } from '@builder.io/qwik-city';

const translationData = import.meta.glob('/src/i18n/**/*.json', {
  as: 'raw',
  eager: true,
});

const loadTranslation$: LoadTranslationFn = server$(
  (lang: string, asset: string) =>
    JSON.parse(translationData[`/src/i18n/${lang}/${asset}.json`]),
) as LoadTranslationFn;

export const translationFn: TranslationFn = {
  loadTranslation$: loadTranslation$,
};
