import { component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './hero.css?inline';
import { $translate as t, Speak } from 'qwik-speak';
import Container from '../../container/container';
import Button, { ButtonTheme } from '../../button/button';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Container>
      <header class="flex flex-col items-center text-center gap-8 py-32">
        <h1 class="text-6xl font-bold text-blue-gray-900">
          {t(
            'app.hero.title@@Module Federation: streamline your microfrontends'
          )}
        </h1>
        <p class="font-medium text-lg text-blue-gray-900">
          {t(
            'app.hero.subtitle@@Module Federation aims to solve the sharing of modules in a distributed system. It allows you to ship those critical shared pieces as macro or as micro as you would like. It does this by pulling them out of the build pipeline and out of your apps'
          )}
        </p>
        <div class="flex gap-4">
          <Button width="196px" theme={ButtonTheme.SOLID} href="#" type="link">
            Documentation
          </Button>
          <Button
            width="196px"
            theme={ButtonTheme.OUTLINE}
            href="#"
            type="link"
          >
            Learn
          </Button>
        </div>
      </header>
    </Container>
  );
});