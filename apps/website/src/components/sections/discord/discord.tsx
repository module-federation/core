import { component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './discord.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <section>
      <p>
        Join to Module Federation community in <a href="#">Discord</a>
      </p>
    </section>
  );
});
