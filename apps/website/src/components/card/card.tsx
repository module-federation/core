import { component$, Slot, useStylesScoped$ } from '@builder.io/qwik';
import styles from './card.css?inline';

export interface CardProps {
  hover?: boolean;
}
export default component$((props: CardProps) => {
  useStylesScoped$(styles);

  return (
    <div
      class={`relative border border-blue-gray-400 bg-white h-full w-full ${
        props.hover && 'transition-shadow hover:shadow-card'
      }`}
    >
      <Slot />
    </div>
  );
});
