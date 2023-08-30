import { component$, Slot, useStylesScoped$ } from '@builder.io/qwik';
import { IconName, iconsMap } from './data';
import styles from './icon.css?inline';

export interface IconProps {
  name: IconName;
  size: string;
  class?: string;
}

export default component$((props: IconProps) => {
  useStylesScoped$(styles);

  return (
    <div
      class={`inline-block ${props.class || ''}`}
      style={{ width: props.size, height: props.size }}
    >
      {iconsMap[props.name]}
    </div>
  );
});
