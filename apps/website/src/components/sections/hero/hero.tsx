import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t } from 'qwik-speak';

import styles from './hero.css?inline';
import Container, { ContainerTheme } from '../../container/container';
import Button, { ButtonTheme } from '../../button/button';
import { centerShape, leftShape, rightShape } from './shapes';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Container theme={ContainerTheme.OPAQUE}>
            <div class="block h-[88px] z-[999]"></div>
      <header class="flex flex-col items-center text-center gap-4 pt-10 pb-24 md:gap-8 md:py-32 w-full overflow-x-hidden">
        <h1 class="text-4xl leading-tight md:text-6xl md:leading-none font-bold text-blue-gray-900">
          {t('hero.title@@Module Federation: streamline your microfrontends')}
        </h1>
        <p class="font-medium text-base md:text-lg text-blue-gray-900 break-words">
          {t(
            'hero.subtitle@@Module Federation aims to solve the sharing of modules in a distributed system. It allows you to ship those critical shared pieces as macro or as micro as you would like. It does this by pulling them out of the build pipeline and out of your apps'
          )}
        </p>
        <div class="flex flex-col md:flex-row gap-4 w-full md:justify-center">
          <Button
            class="w-full md:w-[196px]"
            theme={ButtonTheme.SOLID}
            href="https://module-federation.io/en/mf-docs/2.5/setup"
            type="link"
          >
            {t('hero.actions.documentation@@Documentation')}
          </Button>
          <Button
            class="w-full md:w-[196px]"
            theme={ButtonTheme.OUTLINE}
            href="https://module-federation.io/en/mf-docs/2.5/getting-started"
            type="link"
          >
            {t('hero.actions.learn@@Learn')}
          </Button>
        </div>
      </header>

      <div q:slot="background" class="hidden md:block">
        <div class="inline-block w-64 absolute top-[88px] left-0 -translate-x-1/2 blur-lg">
          {leftShape}
        </div>
        <div class="inline-block w-1/3 absolute top-2/4 left-1/2 -translate-x-1/2 blur-lg">
          {centerShape}
        </div>
        <div class="inline-block w-72 absolute top-[88px] right-0 translate-x-1/3 blur-lg">
          {rightShape}
        </div>
      </div>
    </Container>
  );
});
