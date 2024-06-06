import {
  component$,
  useSignal,
  useStylesScoped$,
  $,
  useStore,
  useOnDocument,
  useVisibleTask$,
} from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { useSpeakContext, $translate as t } from 'qwik-speak';
import { config, LOCALES, localizedUrl as locUrl } from '../../speak-config';
import Container, { ContainerTheme } from '../container/container';
import { IconName } from '../icon/data';
import Icon from '../icon/icon';
import styles from './navbar.css?inline';
import Button, { ButtonPropsTarget, ButtonTheme } from '../button/button';
import Select, { SelectOption } from '../forms/select/select';

export const locales = [
  {
    name: 'Eng',
    lang: 'en-US',
  },
  {
    name: 'Port',
    lang: 'pt-BR',
  },
  {
    name: '中文',
    lang: 'zh-CN',
  },
];

export interface NavbarProps {
  theme?: ContainerTheme;
  activeHref?: string;
}

export default component$((props: NavbarProps) => {
  useStylesScoped$(styles);
  const navbarOpen = useSignal(false);
  const discoverOnView = useSignal(false);
  const enterpriseOnView = useSignal(false);
  const position = useSignal(1);
  const loc = useLocation();
  const speakState = useSpeakContext();
  const selectedLocale = locales.find((l) => l.lang === speakState.locale.lang);

  const localizedUrl = (url: string) => {
    return locUrl(url, speakState);
  };

  useVisibleTask$(
    () => {
      const isElementOnView = (selector: string) => {
        const el = document.querySelector(selector);
        if (!el) {
          return false;
        }

        const rect = el.getBoundingClientRect();

        const elTop = rect.top + 100;
        const elBottom = rect.bottom - 100;
        const elHeight = rect.height;
        const wHeight =
          window.innerHeight || document.documentElement.clientHeight;
        const isFullyVisible = elTop >= 0 && elBottom <= wHeight;
        const partiallyVisible = elTop + elHeight >= 0 && elBottom <= wHeight;

        return isFullyVisible || partiallyVisible;
      };

      const listener = () => {
        position.value = window.scrollY;

        discoverOnView.value = isElementOnView('#discover');
        enterpriseOnView.value = isElementOnView('#contact');
      };

      listener();

      document.addEventListener('scroll', listener);

      return () => {
        document.removeEventListener('scroll', listener);
      };
    },
    { strategy: 'document-ready' },
  );

  const changeLocale$ = $((locale: string) => {
    const newLocale = LOCALES[locale];
    const url = new URL(location.href);
    if (loc.params.lang) {
      if (newLocale.lang !== config.defaultLocale.lang) {
        url.pathname = url.pathname.replace(loc.params.lang, newLocale.lang);
      } else {
        url.pathname = url.pathname.replace(
          new RegExp(`(/${loc.params.lang}/)|(/${loc.params.lang}$)`),
          '/',
        );
      }
    } else if (newLocale.lang !== config.defaultLocale.lang) {
      url.pathname = `/${newLocale.lang}${url.pathname}`;
    }

    location.href = url.toString();
  });

  const navLis = [
    {
      label: t('navbar.menu.documentation@@Documentation'),
      href: '/docs/en/mf-docs/0.2/getting-started/',
    },
    {
      label: t('navbar.menu.discover@@Discover'),
      href: localizedUrl('/#discover'),
      active: discoverOnView.value,
    },
    {
      label: t('navbar.menu.showcase@@Showcase'),
      href: localizedUrl('showcase'),
    },
    {
      label: t('navbar.menu.enterprise@@Enterprise'),
      href: localizedUrl('/#contact'),
      active: enterpriseOnView.value,
    },
    {
      label: t('navbar.menu.medusa@@Medusa'),
      href: 'https://app.medusa.codes/',
      target: '_blank' as ButtonPropsTarget,
    },
  ];

  const theme =
    position.value === 0
      ? props.theme || ContainerTheme.NONE
      : ContainerTheme.GRAY;

  return (
    <div>
      <div class={`fixed w-full top-0 z-[999]`}>
        <Container pattern={position.value === 0} fullWidth theme={theme}>
          <nav
            class={`max-w-7xl mx-auto flex flex-row-reverse xl:flex-row  items-center justify-between px-4 py-6`}
          >
            <a
              href={localizedUrl('/')}
              class="flex w-full items-center justify-end xl:justify-start"
            >
              <img
                src="/module-federation-logo.svg"
                class="h-10"
                alt="Module Federation Logo"
              />
            </a>
            <ul class="hidden xl:flex w-full justify-center gap-8">
              {navLis.map((link) => {
                return (
                  <li key={link.label}>
                    <Button
                      href={link.href}
                      target={link.target}
                      type="link"
                      theme={ButtonTheme.NAV}
                      active={
                        link.active || props.activeHref === link.href || false
                      }
                    >
                      {link.label}
                    </Button>
                  </li>
                );
              })}
            </ul>

            <ul class="hidden xl:flex w-full justify-end items-center gap-5">
              <li class="flex">
                <Button
                  href="https://github.com/module-federation"
                  target="_blank"
                  type="link"
                  theme={ButtonTheme.NAKED_ALT}
                >
                  <Icon name={IconName.GITHUB} size="36px" />
                </Button>
              </li>
              <li class="flex">
                <Button
                  href="https://discord.gg/T8c6yAxkbv"
                  target="_blank"
                  type="link"
                  theme={ButtonTheme.NAKED_ALT}
                >
                  <Icon name={IconName.DISCORD} size="36px" />
                </Button>
              </li>

              <li>
                <Select name="language" value={selectedLocale?.name}>
                  {locales.map((locale) => {
                    return (
                      <SelectOption
                        key={locale.lang}
                        selected={speakState.locale.lang === locale.lang}
                        onClick$={async () => await changeLocale$(locale.lang)}
                      >
                        {locale.name}
                      </SelectOption>
                    );
                  })}
                </Select>
              </li>
            </ul>

            <div class="flex xl:hidden relative">
              <button onClick$={() => (navbarOpen.value = !navbarOpen.value)}>
                <span
                  class={`relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300  ${
                    navbarOpen.value ? ' top-[7px] rotate-45' : ' '
                  }`}
                />
                <span
                  class={`relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300  ${
                    navbarOpen.value ? 'opacity-0 ' : ' '
                  }`}
                />
                <span
                  class={`relative my-1.5 block h-0.5 w-[30px] bg-blue-gray-900 transition-all duration-300 ${
                    navbarOpen.value ? ' top-[-8px] -rotate-45' : ' '
                  }`}
                />
              </button>
            </div>
          </nav>
        </Container>

        <div
          onClick$={() => (navbarOpen.value = false)}
          class={`absolute w-screen z-50 h-screen top-0 right-0 bg-transparent ${
            navbarOpen.value ? 'visible' : 'invisible'
          }`}
        ></div>

        <div
          class={`navbar bg-mf-gray inline-block xl:hidden absolute left-0 px-4 top-[88px] w-full h-screen z-[60] transition-opacity duration-300 ${
            navbarOpen.value ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
        >
          <ul class="flex flex-col gap-8">
            {navLis.map((link) => {
              return (
                <li key={link.label}>
                  <Button
                    href={link.href}
                    type="link"
                    theme={ButtonTheme.NAKED_ALT}
                    active={link.active}
                  >
                    {link.label}
                  </Button>
                </li>
              );
            })}

            <li class="flex gap-8">
              <Button
                href="https://github.com/module-federation"
                target="_blank"
                type="link"
                theme={ButtonTheme.NAKED_ALT}
              >
                <Icon name={IconName.GITHUB} size="36px" />
              </Button>

              <Button
                href="https://discord.gg/T8c6yAxkbv"
                target="_blank"
                type="link"
                theme={ButtonTheme.NAKED_ALT}
              >
                <Icon name={IconName.DISCORD} size="36px" />
              </Button>
            </li>
            <li>
              <select
                class="border-blue-gray-900 w-1/2 px-4 py-1.5 pr-8 bg-mf-gray hover:bg-white focus:bg-mf-gray text-lg focus:border-ui-blue"
                name="language"
                id="language"
                onChange$={async (event: any, el) => {
                  await changeLocale$(event.target?.value as any);
                }}
              >
                {locales.map((locale) => {
                  return (
                    <option
                      key={locale.lang}
                      value={locale.lang}
                      selected={speakState.locale.lang === locale.lang}
                    >
                      {locale.name}
                    </option>
                  );
                })}
              </select>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
});
