import { JSDOM } from 'jsdom';
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
  // Need to use our own custom DOM in order to get a working history
  const dom = new JSDOM(`<!DOCTYPE html>`, { url: 'http://localhost/' });
  dom.window.history.replaceState(null, '', (isHash ? '#' : '') + initialUrl);
  return dom.window as unknown as Window;
}

export function getHtml(container: HTMLElement) {
  return prettyDOM(container, undefined, {
    highlight: false,
  });
}
