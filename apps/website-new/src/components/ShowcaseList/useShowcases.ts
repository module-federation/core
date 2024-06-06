import { useI18n } from '../../i18n';

export type ShowcaseType = 'framework' | 'builder' | 'doc' | 'module';

export type ShowcaseItem = {
  url: string;
  name: string;
  preview: string;
  type: ShowcaseType;
};

export const useShowcases = (): ShowcaseItem[] => {
  const t = useI18n();

  return [
    {
      name: 'Lululemon Athletica',
      url: 'https://shop.lululemon.com/',
      preview: '/showcase/lululemon.png',
      type: 'framework',
    },
    {
      name: 'Business Insider',
      url: 'https://www.businessinsider.com/',
      preview: '/showcase/business_insider.png',
      type: 'framework',
    },
    {
      name: 'BestBuy',
      url: 'https://bestbuy.com/',
      preview: '/showcase/bestbuy.png',
      type: 'framework',
    },
    {
      name: 'Adidas',
      url: 'https://adidas.com/',
      preview: '/showcase/adidas.png',
      type: 'framework',
    },
    {
      name: 'Shopify Partners',
      url: 'https://shopify.com/partners',
      preview: '/showcase/shopify_partners.png',
      type: 'framework',
    },
    {
      name: 'Epic Games',
      url: 'https://store.epicgames.com/',
      preview: '/showcase/epic_games.png',
      type: 'framework',
    },
    {
      name: 'ZoomInfo',
      url: 'https://zoominfo.com/',
      preview: '/showcase/zoominfo.png',
      type: 'framework',
    },
  ];
};
