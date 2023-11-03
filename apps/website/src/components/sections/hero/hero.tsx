import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t, useSpeakContext } from 'qwik-speak';

import styles from './hero.css?inline';
import Container, { ContainerTheme } from '../../container/container';
import Button, { ButtonTheme } from '../../button/button';
import { centerShape, leftShape, rightShape } from './shapes';
import { localizedUrl as locUrl } from '../../../speak-config';
import Line from '../../line/line';

export default component$(() => {
  useStylesScoped$(styles);

  const speakState = useSpeakContext();

  const localizedUrl = (url: string) => {
    return locUrl(url, speakState);
  };

  return (
    <Container theme={ContainerTheme.OPAQUE}>
      <div class="block h-[88px] z-[999]"></div>
      <header class="flex flex-col items-center text-center gap-4 pt-10 pb-24 md:gap-8 md:py-32 w-full overflow-x-hidden">
        <h1 class="text-4xl leading-tight md:text-6xl md:leading-none font-bold text-blue-gray-900">
          {t('hero.title@@Module Federation: streamline your microfrontends')}
        </h1>
        <p class="font-medium text-lg  text-blue-gray-900 break-words max-w-4xl">
          {t(
            'hero.subtitle@@Module Federation aims to solve the sharing of modules in a distributed system. It allows you to ship those critical shared pieces as macro or as micro as you would like. It does this by pulling them out of the build pipeline and out of your apps',
          )}
        </p>
        <div class="flex flex-col md:flex-row gap-4 w-full md:justify-center">
          <Button
            class="w-full md:w-[196px]"
            theme={ButtonTheme.SOLID}
            href="/docs/en/mf-docs/0.2/setup"
            type="link"
          >
            {t('hero.actions.documentation@@Documentation')}
          </Button>
          <Button
            class="w-full md:w-[196px]"
            theme={ButtonTheme.OUTLINE}
            href={localizedUrl('/#learn')}
            type="link"
          >
            {t('hero.actions.learn@@Learn')}
          </Button>
        </div>
      </header>

      <div q:slot="background">
        <div class="inline-block absolute w-40 top-1/3 left-0 -translate-x-1/2 -translate-y-1/2 md:w-72 md:top-1/2">
          {leftShape}
        </div>

        <div class="inline-block absolute bottom-0 w-[90%] left-1/2 translate-y-1/2 -translate-x-1/2 md:w-5/12 md:top-[60%] md:translate-y-0">
          {centerShape}
        </div>

        <div class="inline-block absolute w-40 top-1/3 right-0 translate-x-1/3 -translate-y-1/2 md:w-72 md:top-1/2">
          {rightShape}
        </div>
      </div>

      <div q:slot="background-no-overlay">
        <Line
          showStart={false}
          class="absolute w-20 md:w-40 top-1/3 md:top-1/2 left-0 rotate-[30deg] origin-left"
        />
        <Line class="absolute bottom-[12%] left-[-2px] md:left-1/2 w-3/12 md:w-5/12 md:-translate-x-1/2 rotate-[30deg] origin-left" />
        <Line class="absolute bottom-[12%] right-[-2px] md:left-1/2 w-3/12 md:w-5/12 md:-translate-x-1/2 -rotate-[30deg] origin-right" />
        <Line class="absolute w-32 md:w-64 top-[25%] md:top-1/3 right-[5%] translate-x-1/2 rotate-90 " />
      </div>
    </Container>
  );
});

// inline-block absolute  w-3/4 left-1/2 -translate-x-1/2 md:w-5/12
