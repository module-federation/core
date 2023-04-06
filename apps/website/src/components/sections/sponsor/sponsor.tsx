import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t } from 'qwik-speak';

import Button, { ButtonTheme } from '../../button/button';
import Section from '../../section/section';
import { centerShape, leftShape, rightShape } from './shapes';
import styles from './sponsor.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Section id="sponsor">
      <div class="flex flex-col items-center gap-8">
        <h2 class="text-3xl text-blue-gray-900 font-bold mx-auto text-center">
          {t('sponsor.title@@Sponsor Module Federation!')}
        </h2>

        <p
          class="text-blue-gray-900 font-medium text-lg text-center"
          dangerouslySetInnerHTML={t(
            'sponsor.subtitle@@Module Federation offers the chance to be part of a technology community making a positive impact<br> and receive benefits and recognition opportunities in return.'
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
        class="relative w-11/12 h-full max-w-1225 mx-auto hidden md:block"
      >
        <div class="w-40 absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 blur-lg">
          {leftShape}
        </div>
        <div class="w-56 absolute bottom-0 left-[60%] translate-y-1/3 blur-lg">
          {centerShape}
        </div>
        <div class="w-36 absolute top-0 right-0 -translate-x-1/3 -translate-y-1/2 blur-lg">
          {rightShape}
        </div>
      </div>
    </Section>
  );
});
