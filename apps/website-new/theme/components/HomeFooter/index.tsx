import { Link } from 'rspress/theme';
import { useLang } from 'rspress/runtime';
import { useI18n } from '../../i18n/index';

function useFooterData() {
  const t = useI18n();
  const lang = useLang();
  const getLink = (link: string) => (lang === 'en' ? link : `/${lang}${link}`);

  return [
    {
      title: t('guide'),
      items: [
        {
          title: t('quickStart'),
          link: getLink('/guide/start/quick-start'),
        },
      ],
    },
    {
      title: 'Configuration',
      items: [
        {
          title: t('Configuration'),
          link: getLink('/configure/index'),
        },
      ],
    },
    {
      title: t('friendLink'),
      items: [
        {
          title: 'Web Infra',
          link: 'https://webinfra.org',
        },
        {
          title: 'Rspack',
          link: 'https://www.rspack.dev/',
        },
        {
          title: 'Modern.js Framework',
          link: 'https://modernjs.dev/en/',
        },
        {
          title: 'Rspress',
          link: 'https://rspress.dev/',
        },
        {
          title: 'Zephyr Cloud',
          link: 'https://zephyr-cloud.io/',
        },
      ],
    },
    {
      title: t('community'),
      items: [
        {
          title: 'GitHub',
          link: 'https://github.com/module-federation/core',
        },
        // {
        //   title: 'Discord',
        //   link: 'https://discord.gg/ab2Rv4BXwf',
        // },
      ],
    },
  ];
}

export function HomeFooter() {
  const footerData = useFooterData();
  return (
    <div className="flex flex-col border-t dark:border-dark-50 items-center">
      <div className="pt-8 pb-4 w-full justify-around max-w-6xl hidden sm:flex">
        {footerData.map((item, newKey) => (
          <div className="flex flex-col items-start" key={newKey}>
            <h2 className="font-bold my-4 text-lg">{item.title}</h2>
            <ul className="flex flex-col gap-3">
              {item.items.map((subItem, key) => (
                <li key={newKey + key}>
                  <Link href={subItem.link}>
                    <span className="font-normal">{subItem.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-center">
        <h2 className="font-normal text-sm text-gray-600 dark:text-light-600 py-4">
          © {new Date().getFullYear()} Module Federation core team. All Rights
          Reserved.
        </h2>
      </div>
    </div>
  );
}
