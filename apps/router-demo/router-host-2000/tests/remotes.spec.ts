import { test, expect } from '@playwright/test';
import Insight, { TextElement, query, retrieveOneElement } from 'midscene';

const remote1 = 'http://localhost:2001/';
const remote2 = 'http://localhost:2002/';
const remote3 = 'http://localhost:2003/';

test('remote pages can be launched', async ({ page }) => {
  const parsePage = async () => {
    const insight = await Insight.fromPlaywrightPage(page);

    const contents = await insight.segment({
      homeLink: 'link to Home page',
      detailLink: query('link to Detail page', {
        link: retrieveOneElement('link to Detail page'),
      }),
      contentTypeString: query(
        'a line of string, indicates the page content type',
        {
          content: 'string, the original string on page',
        },
      ),
      pageContent: 'content below links',
    });

    return contents;
  };
  const pages = [remote1, remote2, remote3];

  for (const pageUrl of pages) {
    console.log(`will launch ${pageUrl}`);
    await page.goto(pageUrl);
    await new Promise((r) => setTimeout(r, 3000));
    const contents = await parsePage();
    expect(contents.contentTypeString.content).toContain('home page');

    // click detail link
    const detailLink = contents.detailLink.link as any as TextElement;
    expect(detailLink).toBeTruthy();
    await page.mouse.click(...detailLink.center);
    await new Promise((r) => setTimeout(r, 3000));

    const content2 = await parsePage();
    expect(content2.contentTypeString.content).toContain('detail page');
  }
});
