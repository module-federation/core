import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLocale, initializeLocale, localeUrl } from '../shared/i18n.ts';

test('explicit locale persists across navigation and overrides saved language', () => {
  const values = new Map([['mf-workspace-locale', 'zh']]);
  const browser = {
    location: new URL(
      'http://localhost:4173/workbench?lang=en&path=%2Frecommendations',
    ),
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  };
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    'document',
  );
  Object.defineProperty(globalThis, 'window', {
    value: browser,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'document', {
    value: { documentElement: { lang: '' }, title: '' },
    configurable: true,
  });
  try {
    assert.equal(getLocale(), 'en');
    initializeLocale();
    assert.equal(document.documentElement.lang, 'en');
    assert.equal(values.get('mf-workspace-locale'), 'en');
    assert.equal(
      localeUrl('/workbench?path=%2Frecommendations#preview'),
      '/workbench?path=%2Frecommendations&lang=en#preview',
    );
    browser.location = new URL('http://localhost:4173/deploy/root');
    assert.equal(getLocale(), 'en');
    browser.location = new URL('http://localhost:4173/workbench?lang=zh');
    assert.equal(getLocale(), 'zh');
    browser.localStorage.getItem = () => {
      throw new Error('Storage blocked');
    };
    browser.localStorage.setItem = () => {
      throw new Error('Storage blocked');
    };
    browser.location = new URL('http://localhost:4173/workbench?lang=en');
    initializeLocale();
    assert.equal(localeUrl('/deploy/root'), '/deploy/root?lang=en');
    browser.location = new URL('http://localhost:4173/workbench?lang=unknown');
    assert.equal(getLocale(), 'zh');
  } finally {
    if (previousWindow)
      Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    if (previousDocument)
      Object.defineProperty(globalThis, 'document', previousDocument);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});
