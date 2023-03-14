import { component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './footer.css?inline';

export const links = [
  { label: 'Examples', href: '#' },
  { label: 'Practical guide', href: '#' },
  { label: 'Try Medusa', href: '#' },
  { label: 'Documentation', href: '#' },
  { label: 'Become a sponsor', href: '#' },
];

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <footer class="flex flex-col items-center py-28 gap-10">
      <img src="/module-federation-logo.svg" class="h-10" alt="Flowbite Logo" />

      <div class="flex items-center justify-center gap-10">
        {links.map((link) => {
          return <a class="font-medium text-lg" href={link.href}>{link.label}</a>;
        })}
      </div>
    </footer>
  );
});
