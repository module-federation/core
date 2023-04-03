import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t } from 'qwik-speak';

import Section from '../../section/section';
import styles from './discord.css?inline';
import { centerShape, leftShape, rightShape } from './shapes';

// TODO: Check why #00B9FF is not on collor pallete
export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Section>
      <div class="flex flex-col items-center">
        <p class="text-3xl text-blue-gray-900 font-bold max-w-lg mx-auto text-center leading-tight md:leading-none">
          {t('discord.title@@Join to Module Federation community in')}{' '}
          <a
            class="text-[#00B9FF] underline decoration-solid decoration-1 underline-offset-2"
            href="https://discord.gg/T8c6yAxkbv"
          >
            {t('discord.action@@Discord')}
          </a>
        </p>
      </div>

      <div
        q:slot="background"
        class="relative w-11/12 h-full max-w-1225 mx-auto hidden md:block"
      >
        <div class="w-64 absolute top-1/4 left-0 blur-lg">{leftShape}</div>
        <div class="w-52 absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 blur-lg">
          {centerShape}
        </div>
        <div class="w-48 absolute top-6 right-0 -translate-y-1/2 blur-lg">
          {rightShape}
        </div>
      </div>
    </Section>
  );
});
