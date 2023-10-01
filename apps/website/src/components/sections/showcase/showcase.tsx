import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t, useSpeakContext } from 'qwik-speak';
import Button, { ButtonTheme } from '../../button/button';
import { ContainerTheme } from '../../container/container';
import Section, { SectionHeader, SectionPadding } from '../../section/section';
import styles from './showcase.css?inline';
import { localizedUrl as locUrl } from '../../../speak-config';

export const cards = [
  {
    name: 'Lululemon Athletica',
    previewSrc: '/showcase/lululemon.png',
    url: 'shop.lululemon.com',
  },
  {
    name: 'Business Insider',
    previewSrc: '/showcase/business_insider.png',
    url: 'businessinsider.com',
  },
  {
    name: 'TikTok',
    previewSrc: '/showcase/tiktok.png',
    url: 'tiktok.com',
  },
  {
    name: 'BestBuy',
    previewSrc: '/showcase/bestbuy.png',
    url: 'bestbuy.com',
  },
  {
    name: 'Adidas',
    previewSrc: '/showcase/adidas.png',
    url: 'adidas.com',
  },
  {
    name: 'Shopify Partners',
    previewSrc: '/showcase/shopify_partners.png',
    url: 'shopify.com/partners',
  },
  {
    name: 'Epic Games',
    previewSrc: '/showcase/epic_games.png',
    url: 'store.epicgames.com',
  },
  {
    name: 'PandaDoc',
    previewSrc: '/showcase/panda_doc.png',
    url: 'app.pandadoc.com/login',
  },
  {
    name: 'ZoomInfo',
    previewSrc: '/showcase/zoominfo.png',
    url: 'zoominfo.com',
  },
];

export default component$(() => {
  useStylesScoped$(styles);

  const speakState = useSpeakContext();

  const localizedUrl = (url: string) => {
    return locUrl(url, speakState);
  };

  const title = t('showcase.title@@Showcase');

  return (
    <Section padding={SectionPadding.BOTTOM} theme={ContainerTheme.OPAQUE}>
      <SectionHeader q:slot="header" title={title} />

      <div class="flex flex-col gap-10 items-center">
        <div class="grid gap-x-3 gap-y-10 showcase-grid w-full">
          {cards.map((card) => {
            return (
              <div class="flex flex-col gap-4">
                <img
                  class="border border-blue-gray-400 border bg-white w-full aspect-[97/66] transition-shadow hover:shadow-card"
                  src={card.previewSrc}
                  alt={card.name}
                />
                <div class="flex flex-col gap-2">
                  <div class="text-blue-gray-900 text-2xl font-bold">
                    {card.name}
                  </div>
                  <div class="max-w-full truncate">
                    <a
                      class="text-xl font-semibold text-ui-blue"
                      href={`https://${card.url}`}
                    >
                      {card.url}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          class="w-full md:w-auto"
          theme={ButtonTheme.SOLID}
          href={localizedUrl('/showcase')}
          type="link"
        >
          {t('showcase.action@@See more showcases')}
        </Button>
      </div>
    </Section>
  );
});
