import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t } from 'qwik-speak';

import Button, { ButtonTheme } from '../../button/button';
import Section from '../../section/section';
import { centerShape, leftShape, rightShape } from './shapes';
import styles from './subscribe.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Section>
      <div class="flex flex-col items-center">
        <div class="flex flex-col items-center gap-8">
          <h2 class="text-3xl text-blue-gray-900 font-bold max-w-lg mx-auto text-center">
            {t('subscribe.title@@Subscribe to our email newsletter!')}
          </h2>

          <div class="flex items-center w-full gap-4">
            <input
              class="min-h-[44px] w-full border-blue-gray-900 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue"
              type="email"
              name="email"
              id="email"
              placeholder={t('subscribe.input.placeholder@@Enter your email')}
            />

            <Button class="whitespace-nowrap" theme={ButtonTheme.SOLID} type="button" small>
              {t('subscribe.action@@Subscribe')}
            </Button>
          </div>
        </div>
      </div>

      <div
        q:slot="background"
        class="relative w-11/12 h-full max-w-1225 mx-auto hidden md:block"
      >
        <div class="w-48 absolute bottom-0 left-0 translate-y-1/2 blur-lg">
          {leftShape}
        </div>
        <div class="w-72 absolute top-0 left-[20%] -translate-y-1/3 blur-lg">
          {centerShape}
        </div>
        <div class="w-56 absolute top-1/2 right-0 -translate-x-1/3 -translate-y-1/2 blur-lg">
          {rightShape}
        </div>
      </div>
    </Section>
  );
});
