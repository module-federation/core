import { afterAll, beforeAll, expect, it } from '@rstest/core';
import { chromium, type Browser } from 'playwright';

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser?.close();
});

for (const remote of [1, 2, 3, 5, 6]) {
  it(`boots the standalone remote${remote} entry`, async () => {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    try {
      await page.goto(`http://localhost:200${remote}/`);
      const content =
        remote === 5
          ? 'This is the remote app5 with React 19.'
          : `Remote${remote} home page`;
      await page
        .getByText(content, { exact: remote !== 5 })
        .first()
        .waitFor();

      if (remote !== 5) {
        await page.locator(`.self-remote${remote}-detail-link`).click();
        await page
          .getByRole('heading', {
            name: `Remote${remote} detail page`,
            exact: true,
          })
          .waitFor();
      }

      if (remote === 6) {
        await page.locator('.self-remote6-about-link').click();
        await page
          .getByRole('heading', { name: 'Remote6 about page', exact: true })
          .waitFor();
        expect(await page.locator('body').innerText()).toContain(
          'Improved data loading patterns',
        );
        expect(new URL(page.url()).pathname).toBe('/about');
      }

      expect(errors).toEqual([]);
    } finally {
      await page.close();
    }
  });
}
