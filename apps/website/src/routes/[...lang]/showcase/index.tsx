import { component$ } from '@builder.io/qwik';
import { $translate as t, useSpeakContext } from 'qwik-speak';
import type { DocumentHead } from '@builder.io/qwik-city';
import Section, {
  SectionHeader,
  SectionPadding,
} from '../../../components/section/section';
import { ContainerTheme } from '../../../components/container/container';
import Button, { ButtonTheme } from '../../../components/button/button';
import Navbar from '../../../components/navbar/navbar';
import Footer from '../../../components/footer/footer';
import { localizedUrl as locUrl } from '../../../speak-config';

export const cardRows = [
  [
    {
      name: 'Lululemon Athletica',
      previewSrc: '/showcase/lululemon.png',
      url: 'shop.lululemon.com',
    },
  ],
  [
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
  ],
  [
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
  ],
];

export default component$(() => {
  const theme = ContainerTheme.NONE;

  const speakState = useSpeakContext();
  const localizedUrl = (url: string) => {
    return locUrl(url, speakState);
  };

  const title = t('showcase-page.title@@Showcase');
  const subtitle = t(
    'showcase-page.subtitle@@Meet leading companies embracing Module Federation for their web development needs.',
  );

  return (
    <>
      <Navbar theme={theme} activeHref={localizedUrl('showcase')} />
      <div class="block  h-[80px] md:h-[20px] z-[999]"></div>
      <Section padding={SectionPadding.TOP} theme={theme}>
        <SectionHeader q:slot="header" title={title} subtitle={subtitle} />

        <div class="flex flex-col items-center gap-y-10">
          <div class="flex flex-col items-center gap-y-8">
            {cardRows.map((cards, row) => {
              return (
                <div
                  class={`w-full grid gap-x-2 gap-y-4 grid-cols-1 ${
                    row > 1 && 'md:grid-cols-3'
                  }  ${row === 1 && 'md:grid-cols-2'} `}
                >
                  {cards.map((card) => {
                    return (
                      <div class="relative">
                        <img
                          class="border border-blue-gray-400 border bg-white w-full aspect-[97/66] transition-shadow hover:shadow-card"
                          src={card.previewSrc}
                          alt={card.name}
                        />

                        <div class="absolute block w-full bottom-0 left-0">
                          <div class="block absolute top-0 left-0 w-full h-full bg-blue-gray-900 opacity-70 z-10"></div>
                          <div class="flex relative flex-col p-4 z-20">
                            <h2 class="text-2xl font-semibold text-white">
                              {card.name}
                            </h2>
                            <a
                              href={`https://${card.url}`}
                              class="text-xl text-ui-blue font-semibold"
                            >
                              {card.url}
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <Button
            class="w-full md:w-auto"
            theme={ButtonTheme.SOLID}
            href="https://opencollective.com/module-federation-universe"
            type="link"
          >
            {t('showcase-page.action@@Become a showcase')}
          </Button>
        </div>
      </Section>
      <Footer theme={theme} />
    </>
  );
});

export const head: DocumentHead = {
  title: 'app.title',
  meta: [
    {
      name: 'description',
      content: 'app.meta.description',
    },
    {
      property: 'og:image',
      content: '/default-og.png',
    },
  ],
};
