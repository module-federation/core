import {
  component$,
  QRL,
  QwikChangeEvent,
  Slot,
  useSignal,
  useStylesScoped$,
} from '@builder.io/qwik';

import styles from './select.css?inline';

export const borderStyle = 'border-blue-gray-900 border';
export const styleClass =
  'px-4 py-1.5 bg-mf-gray hover:bg-white focus:bg-mf-gray text-lg ';

export interface SelectProps {
  name: string;

  id?: string;
  class?: string;
  value?: string;
}

export default component$((props: SelectProps) => {
  useStylesScoped$(styles);

  const open = useSignal(false);

  return (
    <>
      <div
        onClick$={() => (open.value = false)}
        class={`absolute w-screen h-screen top-0 right-0 bg-transparent ${
          open.value ? 'visible' : 'invisible'
        }`}
      ></div>

      <button
        class={`relative ${borderStyle} ${styleClass} ${props.class || ''}`}
        onClick$={() => (open.value = !open.value)}
      >
        <div class="flex gap-2 items-center ">
          <div>{props.value}</div>

          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0.410826 0.910826C0.736263 0.585389 1.2639 0.585389 1.58934 0.910826L6.00008 5.32157L10.4108 0.910826C10.7363 0.585389 11.2639 0.585389 11.5893 0.910826C11.9148 1.23626 11.9148 1.7639 11.5893 2.08934L6.58934 7.08934C6.2639 7.41477 5.73626 7.41477 5.41083 7.08934L0.410826 2.08934C0.0853888 1.7639 0.0853888 1.23626 0.410826 0.910826Z"
              fill="#1C2135"
            />
          </svg>
        </div>

        {open.value && (
          <div
            class={`dropdown absolute bottom-[-6px] left-[-1px] translate-y-full p-0 ${borderStyle} z-[60]`}
          >
            <Slot />
          </div>
        )}
      </button>
    </>
  );
});

export interface SelectOptionProps {
  selected?: boolean;

  onClick$?: QRL<() => void>;
}

export const SelectOption = component$((props: SelectOptionProps) => {
  return (
    <button
      onClick$={props.onClick$}
      class={`flex w-full ${styleClass} border-0 text-left hover:bg-blue-gray-300 ${
        props.selected && 'bg-blue-gray-300'
      }`}
    >
      <Slot />
    </button>
  );
});
