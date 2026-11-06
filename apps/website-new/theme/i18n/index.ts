import { withBase, useLang } from '@rspress/core/runtime';
import { DE_DE } from './deDE';
import { EN_US } from './enUS';
import { ES_ES } from './esES';
import { PT_BR } from './ptBR';
import { ZH_CN } from './zhCN';

const translations = {
  de: DE_DE,
  en: EN_US,
  es: ES_ES,
  'pt-BR': PT_BR,
  zh: ZH_CN,
} as const;

export function useUrl(url: string) {
  const lang = useLang();
  return withBase(lang === 'zh' ? url : `/en${url}`);
}

export function useI18n() {
  const lang = (useLang() as keyof typeof translations) || 'en';
  return (key: keyof typeof EN_US) => translations[lang][key];
}
