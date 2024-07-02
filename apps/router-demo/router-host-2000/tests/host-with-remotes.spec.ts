import { test, expect, Page } from '@playwright/test';
import Insight, { query } from 'midscene';

const host = 'http://localhost:2000/';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

test('[detail] route in the nav', async ({ page }) => {
  await page.goto(host);
  await sleep(3000);
  const insight = await Insight.fromPlaywrightPage(page);

  // Detail
  const detailBtn = await insight.findElement(
    '"Detail" button in the top navigation bar',
  );
  expect(detailBtn).toBeTruthy();
  await page.mouse.click(...detailBtn!.center);
  await sleep(1000);

  const remoteButton = await insight.findElement(
    'a button named "Remote Button" on page',
  );
  expect(remoteButton).toBeTruthy();
});

const gotoMenu = async (page: Page, menuName: string, subMenuName: string) => {
  const insight = await Insight.fromPlaywrightPage(page);
  const menuBtn = await insight.findElement(
    `"${menuName}" button in the top navigation bar`,
  );
  expect(menuBtn).toBeTruthy();
  await page.mouse.click(...menuBtn!.center);
  await sleep(1000);

  const subMenuBtn = await insight.findElement(
    `"${subMenuName}" button in the popup for the sub-route of ${menuName} of the top navigation bar`,
  );
  expect(subMenuBtn).toBeTruthy();
  await page.mouse.click(...subMenuBtn!.center);
  await sleep(3000);
};

test('[remote1] route in the nav', async ({ page }) => {
  await page.goto(host);
  await sleep(3000);
  const insight = await Insight.fromPlaywrightPage(page);
  await gotoMenu(page, 'Remote1', 'Home');

  const tableContent = await insight.findElement(
    query('A table cell indicates the age of "胡彦祖"', {
      age: 'number',
    }),
  );
  expect(`${tableContent?.age}`).toBe('42');
});

test('[remote2] route in the nav', async ({ page }) => {
  await page.goto(host);
  await sleep(3000);
  const insight = await Insight.fromPlaywrightPage(page);
  await gotoMenu(page, 'Remote2', 'Detail');

  // check the image content
  const imageContent = await insight.segment(
    query('main image of the page content', {
      gender:
        'What is the gender of the person in the image? answer: male / female',
      wearHat: 'Boolean, if he or she is wearing a hat',
    }),
  );

  expect(imageContent?.gender).toBe('female');
  expect(imageContent?.wearHat).toEqual(true);
});

test('[remote3] route in the nav', async ({ page }) => {
  await page.goto(host);
  await sleep(3000);
  const insight = await Insight.fromPlaywrightPage(page);
  await gotoMenu(page, 'Remote3', 'Detail');

  // check the content
  const textContent = await insight.findElement(
    'text element below the title "Remote3 Detail Page"',
  );
  expect(textContent?.content).toContain('About');
});
