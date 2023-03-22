import { component$, Slot, useStylesScoped$ } from '@builder.io/qwik';
import styles from './container.css?inline';

export enum ContainerTheme {
  PINK = 'pink',
  OPAQUE = 'opaque',
  NONE = 'none',
}

export interface ContainerProps {
  theme?: ContainerTheme;
  fullWidth?: boolean;
}

export default component$((props: ContainerProps) => {
  useStylesScoped$(styles);

  const containerClasses = {
    [ContainerTheme.PINK]: 'bg-[#EFEFFF]',
    [ContainerTheme.OPAQUE]: 'bg-white',
    [ContainerTheme.NONE]: 'bg-transparent',
  }[props.theme || ContainerTheme.PINK];

  const overlayClasses = {
    [ContainerTheme.PINK]: '',
    [ContainerTheme.OPAQUE]: 'bg-white opacity-10',
    [ContainerTheme.NONE]: 'bg-transparent',
  }[props.theme || ContainerTheme.PINK];

  const patternClasses = {
    [ContainerTheme.PINK]: 'bg-pattern bg-repeat opacity-5',
    [ContainerTheme.OPAQUE]: 'bg-pattern bg-repeat opacity-5',
    [ContainerTheme.NONE]: '',
  }[props.theme || ContainerTheme.PINK];

  return (
    <div class={`w-full relative ${containerClasses || ''}`}>
      <div class="block absolute h-full w-full top-0 left-0 z-10">
        <Slot name="background" />
      </div>
      <div
        class={`absolute h-full w-full top-0 left-0 z-20 ${
          overlayClasses || ''
        }`}
      ></div>
      <div
        class={`absolute h-full w-full top-0 left-0 z-20 ${patternClasses}`}
      ></div>
      <div
        class={`relative mx-auto z-20 ${
          props.fullWidth ? 'w-full' : 'w-11/12 max-w-1225'
        }`}
      >
        <Slot />
      </div>
    </div>
  );
});
