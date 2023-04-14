import { component$, Slot, useStylesScoped$ } from '@builder.io/qwik';

import styles from './line.css?inline';

export interface LineProps {
  class?: string;
}

export default component$((props: LineProps) => {
  useStylesScoped$(styles);

  return (
    <div class={`flex items-center w-full ${props.class || ''}`}>
      <div class="w-[3px] h-[3px] rounded-full bg-blue-gray-400"></div>
      <div class="flex-1 w-full h-[1px] bg-blue-gray-400"></div>
      <div class="w-[3px] h-[3px] rounded-full bg-blue-gray-400"></div>
    </div>
  );
});
