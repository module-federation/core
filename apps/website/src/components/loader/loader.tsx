import { component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './loader.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <div class="inline-flex flex justify-center items-center gap-1">
      <div
        class={`inline-block bg-blue-gray-300 h-2 w-2 rounded-full animation animation--first`}
      ></div>
      <div
        class={`inline-block bg-blue-gray-500 h-2 w-2 rounded-full animation animation--second`}
      ></div>
      <div
        class={`inline-block bg-blue-gray-900 h-2 w-2 rounded-full animation animation--third`}
      ></div>
    </div>
  );
});
