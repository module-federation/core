import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t } from 'qwik-speak';

import Button, { ButtonTheme } from '../../button/button';
import Section from '../../section/section';
import { centerShape, leftShape, rightShape } from './shapes';
import styles from './sponsor.css?inline';
import Line from '../../line/line';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Section id="sponsor">
      <div class="flex flex-col items-center gap-8">
        <h2 class="text-4xl leading-normal md:text-3xl text-blue-gray-900 font-bold max-w-lg mx-auto text-center leading-tight">
          {t('sponsor.title@@Sponsor Module Federation!')}
        </h2>

        <p
          class="text-blue-gray-900 font-medium text-lg text-center"
          dangerouslySetInnerHTML={t(
            'sponsor.subtitle@@Module Federation offers the chance to be part of a technology community making a positive impact<br> and receive benefits and recognition opportunities in return.',
          )}
        ></p>

        <Button
          class="w-full md:w-auto"
          theme={ButtonTheme.SOLID}
          href="https://opencollective.com/module-federation-universe"
          type="link"
        >
          {t('sponsor.action@@Become a sponsor')}
        </Button>
      </div>

      <div
        q:slot="background"
        class="relative w-11/12 h-full max-w-1225 mx-auto"
      >
        <div class="absolute w-40 top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 ">
          {leftShape}
        </div>
        <div class="absolute w-56 bottom-0 left-[60%] translate-y-1/3 ">
          {centerShape}
        </div>
        <div class="absolute w-36 top-0 right-0 -translate-x-1/3 -translate-y-1/2 ">
          {rightShape}
        </div>
      </div>

      <div q:slot="background-no-overlay">
        <Line showEnd={false} class="absolute w-1/4 top-[25%] right-0" />
        <Line
          showEnd={false}
          class="absolute w-52 bottom-0 left-[14%] rotate-90 origin-right -translate-x-full translate-y-1/2"
        />
      </div>
    </Section>
  );
});
