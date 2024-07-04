import { test, expect } from '@playwright/test';
import Insight, { TextElement, query, retrieveOneElement } from 'midscene';

const host = 'http://localhost:2000/';
const hostMemoryRouter = 'http://localhost:2000/memory-router';

interface SectionScheme {
  homeLink: TextElement;
  detailLink: TextElement;
  secondaryTitle: string;
  contentType: 'table' | 'textParagraph' | 'paragraphWithImage' | 'other';
}

test('host page can be launched', async ({ page }) => {
  await page.goto(host);

  const insight = await Insight.fromPlaywrightPage(page);
  const overall = await insight.segment({
    nav: query('navigation items', {
      navNames: 'string[]',
      remote1: retrieveOneElement('remote1 link'),
      remote2: retrieveOneElement('remote2 link'),
      remote3: retrieveOneElement('remote3 link'),
    }),
    mainTitle: query('main title content of the page', {
      titleString: 'string',
    }),
    tableInContent: query('a table shows in content', {
      records:
        'array of records, {name: string, age: number, address: string, action: string[], tags: string[]}[]',
    }),
  });

  expect(overall.nav.navNames).toEqual([
    'Home',
    'Detail',
    'Remote1',
    'Remote2',
    'Remote3',
    'Memory-router',
  ]);
  expect(overall.mainTitle.titleString).toBe('Router host Home page');
  expect(overall.tableInContent.records[2]).toStrictEqual({
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
    action: ['Invite Joe Black', 'Delete'],
    tags: ['COOL', 'TEACHER'],
  });
});

test('host page with memory router', async ({ page }) => {
  await page.goto(hostMemoryRouter);
  await new Promise((r) => setTimeout(r, 3000));

  const insight = await Insight.fromPlaywrightPage(page);

  const getPageParsed = async () => {
    const sectionPrompt = {
      homeLink: retrieveOneElement('link to home page'),
      detailLink: retrieveOneElement('link to detail page'),
      secondaryTitle: 'string, title below the links',
      contentType:
        'one of these: table |  textParagraph | paragraphWithImage | other',
    };

    const overall = await insight.segment({
      nav: 'navigation items',
      remote1Content: query<SectionScheme>(
        'remote1 section, should be the first column of content',
        { ...sectionPrompt },
      ),
      remote2Content: query<SectionScheme>(
        'remote2 content, should be the second column of content',
        { ...sectionPrompt },
      ),
      remote3Content: query<SectionScheme>(
        'remote3 content, should be the third column of content',
        { ...sectionPrompt },
      ),
    });
    return overall;
  };

  const extractSecondTitleAndContentType = (
    parsed: Awaited<ReturnType<typeof getPageParsed>>,
  ) => [
    parsed.remote1Content.secondaryTitle,
    parsed.remote1Content.contentType,
    parsed.remote2Content.secondaryTitle,
    parsed.remote2Content.contentType,
    parsed.remote3Content.secondaryTitle,
    parsed.remote3Content.contentType,
  ];

  // init state
  const parsed1 = await getPageParsed();
  const state1 = extractSecondTitleAndContentType(parsed1);
  expect(state1).toEqual([
    'Remote1 home page',
    'table',
    'Remote2 detail page',
    'paragraphWithImage',
    'Remote3 detail page',
    'textParagraph',
  ]);

  // click all 'home' links
  await page.mouse.click(...parsed1.remote1Content.homeLink.center);
  await page.mouse.click(...parsed1.remote2Content.homeLink.center);
  await page.mouse.click(...parsed1.remote3Content.homeLink.center);
  // sleep
  await new Promise((r) => setTimeout(r, 3000));

  // get state after click
  const parsed2 = await getPageParsed();
  const state2 = extractSecondTitleAndContentType(parsed2);
  expect(state2).toEqual([
    'Remote1 home page',
    'table',
    'Remote2 home page',
    'textParagraph',
    'Remote3 home page',
    'textParagraph',
  ]);

  // click all 'detail' links
  await page.mouse.click(...parsed2.remote1Content.detailLink.center);
  await page.mouse.click(...parsed2.remote2Content.detailLink.center);
  await page.mouse.click(...parsed2.remote3Content.detailLink.center);
  // sleep
  await new Promise((r) => setTimeout(r, 3000));

  // get state after click
  const parsed3 = await getPageParsed();
  const state3 = extractSecondTitleAndContentType(parsed3);
  expect(state3).toEqual([
    'Remote1 detail page',
    'paragraphWithImage',
    'Remote2 detail page',
    'paragraphWithImage',
    'Remote3 detail page',
    'textParagraph',
  ]);
});
