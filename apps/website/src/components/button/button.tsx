import { component$, useStylesScoped$, Slot, QRL } from '@builder.io/qwik';
import Loader from '../loader/loader';
import styles from './button.css?inline';

export type ButtonType = 'submit' | 'button' | 'link';

export enum ButtonTheme {
  SOLID = 'solid',
  OUTLINE = 'outline',
  NAKED = 'naked',
}

export interface ButtonProps {
  type: ButtonType;
  theme: ButtonTheme;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  class?: string;
  small?: boolean;
  onClick?: QRL<() => void>;
}

// TODO: Add support for icons on prefix, suffix and main
// TODO: Check why #00B9FF is not on collor pallete
export default component$((props: ButtonProps) => {
  useStylesScoped$(styles);

  const defaultPadding = props.small ? 'py-3 px-4' : 'py-6 px-8';

  const themeClasses = {
    [ButtonTheme.SOLID]: [
      defaultPadding,
      'relative bg-blue-gray-900 text-white border-blue-gray-900',
      // Hover
      'hover:bg-blue-gray-600 hover:border-blue-gray-600',
      // Focus
      'focus-visible:border-transparent',
      // Selected,
      'active:bg-blue-gray-700 active:border-blue-gray-700',
      // Disabled,
      props.disabled
        ? '!bg-blue-gray-400 !border-blue-gray-400 !pointer-events-none'
        : '',
      props.loading
        ? '!bg-blue-gray-900 !text-white !border-blue-gray-900 !pointer-events-none'
        : '',
    ].join(' '),
    [ButtonTheme.OUTLINE]: [
      defaultPadding,
      'relative bg-transparent text-blue-gray-900 border-blue-gray-900',
      // Hover
      'hover:bg-blue-gray-700 hover:text-white hover:border-blue-gray-700',
      // Focus
      'focus-visible:border-transparent',
      // Selected,
      'active:bg-blue-gray-900 active:border-blue-gray-900 active:text-white',
      // Disabled,
      props.disabled
        ? '!bg-transparent !border-blue-gray-400 !text-blue-gray-400 !pointer-events-none'
        : '',
      props.loading
        ? '!relative !bg-transparent !text-blue-gray-900 !border-blue-gray-900 !pointer-events-none'
        : '',
    ].join(' '),
    [ButtonTheme.NAKED]: [
      'p-0',
      // TODO: Check why #00B9FF is not on collor pallete
      'relative bg-transparent text-[#00B9FF] !border-transparent',
      props.disabled
        ? 'opacity-40 !pointer-events-none'
        : '',
      '',
    ].join(' '),
  };

  const content = (
    <div class={`flex justify-center items-center gap-3`}>
      <div class="flex empty:hidden">
        <Slot name="prefix" />
      </div>
      <div class="text-lg font-medium leading-[1.125rem]">
        <div class={props.loading ? 'invisible' : ''}>
          <Slot /> 
        </div>
        {props.loading && (
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Loader />
          </div>
        )}
      </div>
      <div class="flex empty:hidden">
        <Slot name="suffix" />
      </div>
    </div>
  );

  return props.type === 'link' ? (
    <a
      class={`inline-block border-solid border ${themeClasses[props.theme]} ${
        props.class || ''
      }`}
      href={props.href}
    >
      {content}
    </a>
  ) : (
    <button
      class={`inline-block border-solid border ${themeClasses[props.theme]} ${
        props.class || ''
      }`}
      type={props.type}
      onClick$={props.onClick}
    >
      {content} 
    </button>
  );
});
