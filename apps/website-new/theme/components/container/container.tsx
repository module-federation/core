import React from 'react';
import { component$, Slot, useStylesScoped$ } from '@builder.io/qwik';
import styles from './container.css?inline';

export enum ContainerTheme {
  PINK = 'pink',
  OPAQUE = 'opaque',
  GRAY = 'GRAY',
  NONE = 'none',
}

export interface ContainerProps {
  theme?: ContainerTheme;
  fullWidth?: boolean;
  pattern?: boolean;
}

export default component$((props: ContainerProps) => {
  useStylesScoped$(styles);

  const containerclassNamees = {
    [ContainerTheme.PINK]: 'bg-[#EFEFFF]',
    [ContainerTheme.OPAQUE]: 'bg-mf-gray',
    [ContainerTheme.GRAY]: 'bg-mf-gray',
    [ContainerTheme.NONE]: 'bg-transparent',
  }[props.theme || ContainerTheme.PINK];

  const overlayclassNamees = {
    [ContainerTheme.PINK]: 'backdrop-blur-md bg-transparent',
    [ContainerTheme.OPAQUE]: 'backdrop-blur-xl bg-white/10',
    [ContainerTheme.GRAY]: 'bg-transparent',
    [ContainerTheme.NONE]: 'bg-transparent',
  }[props.theme || ContainerTheme.PINK];

  const patternclassNamees = {
    [ContainerTheme.PINK]:
      props.pattern === false ? 'opacity-0' : 'bg-pattern bg-repeat opacity-40',
    [ContainerTheme.OPAQUE]:
      props.pattern === false ? 'opacity-0' : 'bg-pattern bg-repeat opacity-40',
    [ContainerTheme.GRAY]:
      props.pattern === false ? 'opacity-0' : 'bg-pattern bg-repeat opacity-40',
    [ContainerTheme.NONE]: '',
  }[props.theme || ContainerTheme.PINK];

  return (
    <div className={`w-full relative ${containerclassNamees}`}>
      <div className="block absolute h-full w-full top-0 left-0 z-10">
        <Slot name="background" />
      </div>
      <div
        className={`absolute h-full w-full top-0 left-0 z-20 ${overlayclassNamees} `}
      ></div>
      <div className="block absolute h-full w-full top-0 left-0 z-20">
        <Slot name="background-no-overlay" />
      </div>
      {/* <div
        className={`absolute h-full w-full top-0 left-0 z-20 ${patternclassNamees}`}
      ></div> */}
      <div
        className={`relative mx-auto z-20 ${
          props.fullWidth ? 'w-full' : 'w-11/12 max-w-1225'
        }`}
      >
        <Slot />
      </div>
    </div>
  );
});
