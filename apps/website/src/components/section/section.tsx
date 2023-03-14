import { component$, Slot, useStylesScoped$ } from '@builder.io/qwik';
import Container from '../container/container';
import styles from './section.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Container>
      <section class="flex flex-col items-center gap-10 py-28">
        <div><Slot name="header" /></div>
        <div class="w-full"><Slot /></div>
      </section>
    </Container>
  );
});

export interface SectionHeaderProps {
  title: string;
  subtitle?: string
}

export const SectionHeader = component$((props: SectionHeaderProps) => {
  return (
    <div class="flex flex-col items-center gap-10 text-center">
      <h2 class="text-blue-grey-900 font-bold text-4xl">{ props.title }</h2>
      { props.subtitle && <p class="text-blue-grey-900 text-lg font-medium max-w-4xl">{ props.subtitle }</p> }
    </div>
  );
});
