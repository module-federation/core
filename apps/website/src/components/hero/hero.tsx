import { component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './hero.css?inline';
import { $translate as t, Speak } from 'qwik-speak';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <header>
      <h1>
        {t('app.title@@Module Federation: streamline your microfrontends')}
      </h1>
      <p>
        Module Federation aims to solve the sharing of modules in a distributed
        system. It allows you to ship those critical shared pieces as macro or
        as micro as you would like. It does this by pulling them out of the
        build pipeline and out of your apps
      </p>
      <div>
        <a href="/">Documentation</a>
        <a href="/">Learn</a>
      </div>
    </header>
  );
});
