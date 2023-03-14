import { component$, useStylesScoped$ } from '@builder.io/qwik';
import Button, { ButtonTheme } from '../../button/button';
import Section, { SectionHeader } from '../../section/section';
import styles from './showcase.css?inline';

export const cards = [
  {
    name: 'Lululemon Athletica',
    previewSrc: 'showcase/lululemon.png',
    url: 'https://shop.lululemon.com',
  },
  {
    name: 'Business Insider',
    previewSrc: 'showcase/business_insider.png',
    url: 'https://www.businessinsider.com',
  },
  {
    name: 'TikTok',
    previewSrc: 'showcase/tiktok.png',
    url: 'https://www.tiktok.com',
  },
  {
    name: 'BestBuy',
    previewSrc: 'showcase/bestbuy.png',
    url: 'https://www.bestbuy.com',
  },
  {
    name: 'Adidas',
    previewSrc: 'showcase/adidas.png',
    url: 'https://www.adidas.com',
  },
  {
    name: 'Shopify Partners',
    previewSrc: 'showcase/shopify_partners.png',
    url: 'https://www.shopify.com/partners',
  },
  {
    name: 'Epic Games',
    previewSrc: 'showcase/epic_games.png',
    url: 'https://store.epicgames.com/en-US/',
  },
  {
    name: 'PandaDoc',
    previewSrc: 'showcase/panda_doc.png',
    url: 'https://app.pandadoc.com/login/',
  },
  {
    name: 'ZoomInfo',
    previewSrc: 'showcase/zoominfo.png',
    url: 'ttps://www.zoominfo.com',
  },
];

// TODO: Check why #00B9FF is not on collor pallete
export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Section>
      <SectionHeader q:slot="header" title="Showcase" />

      <div class="flex flex-col gap-10 items-center">
        <div class="grid gap-x-3 gap-y-10 grid-cols-3 grid-rows-3 w-full">
          {cards.map((card) => {
            return (
              <div class="flex flex-col gap-4 [">
                <img
                  class="border border-blue-gray-400 bg-white"
                  src={card.previewSrc}
                  alt={card.name}
                />
                <div class="flex flex-col gap-2">
                  <div class="text-blue-grey-900 text-2xl font-bold">
                    {card.name}
                  </div>
                  <a
                    class="text-xl font-semibold text-[#00B9FF]"
                    href={card.url}
                  >
                    {card.url}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <Button theme={ButtonTheme.SOLID} href="#" type="link">
          See more showcases
        </Button>
      </div>
    </Section>
  );
});
