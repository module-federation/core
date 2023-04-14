import { component$, useStylesScoped$ } from '@builder.io/qwik';
import Container, { ContainerTheme } from '../../container/container';
import Section from '../../section/section';
import styles from './brands.css?inline';

export const rows = [
  [
    {
      name: 'Shopify Partners',
      src: '/companies/shopify.svg',
    },
    {
      name: 'Cloudflare',
      src: '/companies/cloudflare.svg',
    },
    {
      name: 'Lululemon',
      src: '/companies/lululemon.svg',
    },
    {
      name: 'Adidas',
      src: '/companies/adidas.svg',
    },
    {
      name: 'Zoominfo',
      src: '/companies/zoominfo.svg',
    },
    {
      name: 'Business Insider',
      src: '/companies/business_insider.svg',
    },
  ],
  [
    {
      name: 'Box',
      src: '/companies/box.svg',
    },
    {
      name: 'Best Buy',
      src: '/companies/bestbuy.svg',
    },
    {
      name: 'Panda Doc',
      src: '/companies/pandadoc.svg',
    },
    {
      name: 'TikTok',
      src: '/companies/tiktok.svg',
    },
    {
      name: 'Epic Games',
      src: '/companies/epic_games.svg',
    },
    {
      name: 'Seemrush',
      src: '/companies/katman.svg',
    },
    {
      name: 'Openclassroom',
      src: '/companies/openclassrooms.svg',
    },
  ],
];

export default component$(() => {
  useStylesScoped$(styles);
  return (
    <Section fullWidth theme={ContainerTheme.OPAQUE}>
      <div class="flex flex-col gap-8">
        {rows.map((row, index) => {
          return (
            <div class="overflow-hidden w-full animation-container h-12">
              <div
                key={index}
                class={`flex justify-between animated animated--${index}`}
              >
                {[...row, ...row, ...row].map((logo) => {
                  return (
                    <img
                      key={logo.name + '0'}
                      class="h-12 px-16"
                      src={logo.src}
                      alt={logo.name}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        <div></div>
      </div>
    </Section>
  );
});
