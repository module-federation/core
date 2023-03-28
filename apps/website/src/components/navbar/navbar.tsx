import { component$, useSignal, useStylesScoped$, $ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { useSpeakContext, $translate as t } from 'qwik-speak';
import { config, LOCALES, useLocalizedUrl } from '../../speak-config';
import Card from '../card/card';
import Container, { ContainerTheme } from '../container/container';
import { IconName } from '../icon/data';
import Icon from '../icon/icon';
import styles from './navbar.css?inline';

export const locales = [
  {
    name: 'Eng',
    lang: 'en-US',
  },
  {
    name: 'Port',
    lang: 'pt-BR',
  },
];

export interface NavbarProps {
  theme?: ContainerTheme;
}

// TODO: Extract links to components
export default component$((props: NavbarProps) => {
  useStylesScoped$(styles);
  const localizedUrl = useLocalizedUrl();

  const navbarOpen = useSignal(false);
  const loc = useLocation();
  const speakState = useSpeakContext();

  const changeLocale$ = $((locale: string) => {
    const newLocale = LOCALES[locale];
    const url = new URL(location.href);
    if (loc.params.lang) {
      if (newLocale.lang !== config.defaultLocale.lang) {
        url.pathname = url.pathname.replace(loc.params.lang, newLocale.lang);
      } else {
        url.pathname = url.pathname.replace(
          new RegExp(`(/${loc.params.lang}/)|(/${loc.params.lang}$)`),
          '/'
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
      href: localizedUrl('/')
    },
    {
      label: t('navbar.menu.discover@@Discover'),
      href: localizedUrl('/#discover')
    },
    {
      label: t('navbar.menu.showcase@@Showcase'),
      href: localizedUrl('showcase')
    },
    // {
    //   label: t('navbar.menu.enterprise@@Enterprise'),
    //   href: localizedUrl('/')
    // },
    {
      label: t('navbar.menu.medusa@@Medusa'),
      href: localizedUrl('#medusa')
    }
  ];

  return (
    <>
      <Container fullWidth theme={props.theme || ContainerTheme.OPAQUE}>
        <nav class="max-w-7xl mx-auto flex flex-row-reverse xl:flex-row   items-center justify-between px-4 py-6">
          <a
            href={localizedUrl('/')}
            class="flex w-full items-center justify-end xl:justify-start"
          >
            <img
              src="/module-federation-logo.svg"
              class="h-10"
              alt="Flowbite Logo"
            />
          </a>
          <ul class="hidden xl:flex w-full justify-center gap-8">
            {navLis.map((link) => {
              return (
                <li>
                  <a
                    class="text-blue-gray-900 hover:text-blue-gray-700 text-lg"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <ul class="hidden xl:flex w-full justify-end items-center gap-5">
            <li>
              <a class="flex" href="#">
                <Icon name={IconName.GITHUB} size="36px" />
              </a>
            </li>
            <li>
              <a class="flex" href="#">
                <Icon name={IconName.DISCORD} size="36px" />
              </a>
            </li>
            <li>
              <select
                class="border-blue-gray-900 px-4 py-1.5 pr-8 bg-[#F6F6FA] hover:bg-white focus:bg-[#F6F6FA] text-lg focus:border-[#00B9FF]"
                name="language"
                id="language"
                onChange$={async (event, el) => {
                  await changeLocale$(event.target.value as any);
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
        class={`navbar inline-block xl:hidden absolute left-4 top-[88px] w-[350px] z-[60] transition-opacity duration-300 ${
          navbarOpen.value ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <Card>
          <ul class="flex flex-col p-4 gap-8">
          {navLis.map((link) => {
              return (
                <li>
                  <a
                    class="text-blue-gray-900 hover:text-blue-gray-700 text-lg"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}</ul>
        </Card>
      </div>
    </>
  );
});
