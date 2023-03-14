import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { changeLocale, useSpeakContext } from 'qwik-speak';
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

// TODO: Extract links to components
// NOTE: THIS NAVBAR IS JUST A PROTOTYPE TO TEST TAILWIND INSTALL
export default component$(() => {
  useStylesScoped$(styles);

  const speakState = useSpeakContext();

  return (
    <nav class="container mx-auto flex items-center justify-between py-6">
      <a href="#" class="flex items-center">
        <img
          src="/module-federation-logo.svg"
          class="h-10"
          alt="Flowbite Logo"
        />
      </a>
      <ul class="flex gap-8">
        <li>
          <a
            class="text-blue-gray-900 hover:text-blue-gray-700 text-lg"
            href="/"
          >
            Documentation
          </a>
        </li>
        <li>
          <a
            class="text-blue-gray-900 hover:text-blue-gray-700 text-lg"
            href="/"
          >
            Discover
          </a>
        </li>
        <li>
          <a
            class="text-blue-gray-900 hover:text-blue-gray-700 text-lg"
            href="/"
          >
            Showcase
          </a>
        </li>
        <li>
          <a
            class="text-blue-gray-900 hover:text-blue-gray-700 text-lg"
            href="/"
          >
            Enterprise
          </a>
        </li>
        <li>
          <a
            class="text-blue-gray-900 hover:text-blue-gray-700 text-lg"
            href="/"
          >
            Medusa
          </a>
        </li>
      </ul>
      <div>
        <ul class="flex items-center gap-5">
          <li>
            <a href="#">
              <img src="/icons/github.svg" class="w-9 h-9" alt="Github Icon" />
            </a>
          </li>
          <li>
            <a href="#">
              <img
                src="/icons/discord.svg"
                class="w-9 h-9"
                alt="Discord Icon"
              />
            </a>
          </li>
          <li>
            <select
              name="language"
              id="language"
              onChange$={(event, el) => {
                changeLocale({ lang: event.target.value }, speakState);
              }}
            >
              {locales.map((locale) => {
                return (
                  <option
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
    </nav>
  );
});
