import { component$, Slot, useStylesScoped$ } from '@builder.io/qwik';
import styles from './container.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <div class="w-11/12 lg:w-1225  mx-auto">
      <Slot />
    </div>
  );
});
