import { prettyDOM } from '@testing-library/react';

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, time);
  });
}

export function createContainer() {
  const container = document.createElement('div');
  container.setAttribute('id', 'container');
  document.body.appendChild(container);

  return {
    clean: () => {
      document.body.removeChild(container);
    },
    container,
  };
}

export function getWindowImpl(initialUrl: string, isHash = false): Window {
  // Prefer creating an isolated JSDOM window when jsdom is available.
  // When running in environments where `jsdom` is not hoisted, fall back to the global window.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JSDOM } = require('jsdom') as typeof import('jsdom');
    const dom = new JSDOM(`<!DOCTYPE html>`, { url: 'http://localhost/' });
    dom.window.history.replaceState(null, '', (isHash ? '#' : '') + initialUrl);
    return dom.window as unknown as Window;
  } catch {
    // Fallback – rely on Jest's jsdom environment global window
    const w = (globalThis as any).window as Window;
    // Ensure URL base
    try {
      // Replace state to desired initial URL
      w?.history?.replaceState?.(null, '', (isHash ? '#' : '') + initialUrl);
    } catch {
      // no-op: keep default URL if history isn't available
    }
    return w;
  }
}

export function getHtml(container: HTMLElement) {
  return prettyDOM(container, undefined, {
    highlight: false,
  });
}
