import { component$, Slot, useStylesScoped$ } from '@builder.io/qwik';
import Container, { ContainerTheme } from '../container/container';
import styles from './section.css?inline';

export enum SectionPadding {
  TOP = 'top',
  BOTTOM = 'bottom',
  BOTH = 'both',
  NONE = 'none',
}

export interface SectionProps {
  id?: string;
  theme?: ContainerTheme;
  fullWidth?: boolean;
  padding?: SectionPadding;
  class?: string;
}

export default component$((props: SectionProps) => {
  useStylesScoped$(styles);

  const paddingClasses = {
    [SectionPadding.TOP]: 'pt-14 md:pt-28',
    [SectionPadding.BOTTOM]: 'pb-14 md:pb-28',
    [SectionPadding.BOTH]: 'py-14 md:py-28',
    [SectionPadding.NONE]: '',
  }[props.padding || SectionPadding.BOTH];

  return (
    <Container fullWidth={props.fullWidth} theme={props.theme}>
      <section
        id={props.id}
        class={`flex flex-col items-center gap-10 ${paddingClasses} ${
          props.class || ''
        }`}
      >
        <div class="empty:hidden">
          <Slot name="header" />
        </div>
        <div class="w-full">
          <Slot />
        </div>
      </section>

      <span q:slot="background">
        <Slot name="background" />
      </span>

      <span q:slot="background-no-overlay">
        <Slot name="background-no-overlay" />
      </span>
    </Container>
  );
});

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export const SectionHeader = component$((props: SectionHeaderProps) => {
  return (
    <div class="flex flex-col items-center gap-4 md:gap-10 text-center">
      <h2 class="text-blue-grey-900 font-bold text-4xl leading-tight md:leading-none">
        {props.title}
      </h2>
      {props.subtitle && (
        <p class="text-blue-grey-900 text-lg font-medium max-w-4xl">
          {props.subtitle}
        </p>
      )}
    </div>
  );
});
