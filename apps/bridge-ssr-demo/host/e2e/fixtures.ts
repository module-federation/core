import { expect, test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const browserErrors: string[] = [];
    page.on('console', (message) => {
      const text = message.text();
      if (
        message.type() === 'error' ||
        (message.type() === 'warning' &&
          /hydration|hydrate|did not match|mount|mismatch|recoverable/i.test(
            text,
          ))
      ) {
        browserErrors.push(text);
      }
    });
    page.on('pageerror', (error) => browserErrors.push(error.message));
    await use(page);
    expect(browserErrors, 'unexpected browser errors').toEqual([]);
  },
});

export { expect };
