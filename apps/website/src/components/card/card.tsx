import { component$, Slot, useStylesScoped$ } from '@builder.io/qwik';
import styles from './card.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <div class="border border-blue-gray-400 bg-white h-full w-full">
      <Slot />
    </div>
  );
});
