import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t } from 'qwik-speak';

import Section from '../../section/section';
import styles from './discord.css?inline';
import { centerShape, leftShape, rightShape } from './shapes';
import Line from '../../line/line';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Section>
      <div class="flex flex-col items-center">
        <p class="text-4xl leading-normal md:text-3xl text-blue-gray-900 font-bold max-w-lg mx-auto text-center leading-tight">
          {t('discord.title@@Join to Module Federation community in')}{' '}
          <a
            class="text-ui-blue underline decoration-solid decoration-1 underline-offset-2"
            href="https://discord.gg/T8c6yAxkbv"
            target="_blank"
          >
            {t('discord.action@@Discord')}
          </a>
        </p>
      </div>

      <div
        q:slot="background"
        class="relative w-11/12 h-full max-w-1225 mx-auto block"
      >
        <div class="absolute w-48 md:w-64 top-1/2 md:top-1/4 left-0 ">
          {leftShape}
        </div>
        <div class="absolute w-36 md:w-52 bottom-0 right-[12%] md:right-1/4 translate-x-1/2 translate-y-1/2 ">
          {centerShape}
        </div>
        <div class="absolute w-36 md:w-48 md:w-48 top-6 right-0 -translate-y-1/2 ">
          {rightShape}
        </div>
      </div>

      <div q:slot="background-no-overlay">
        <Line
          showEnd={false}
          class="absolute w-12 md:w-20 bottom-0 left-1/2 rotate-90 -translate-x-full origin-right translate-y-1/2"
        />
        <Line
          showEnd={false}
          class="absolute w-24 md:w-36 top-0 right-0 md:right-[5%] -rotate-[30deg]  origin-right"
        />
        <Line
          showStart={false}
          class="absolute w-24 md:w-36 top-0 left-0 md:left-[5%] rotate-[30deg]  origin-left"
        />
      </div>
    </Section>
  );
});
