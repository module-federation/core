import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t, useSpeakContext } from 'qwik-speak';
import Container, { ContainerTheme } from '../container/container';

import styles from './footer.css?inline';

export interface FooterProps {
  theme?: ContainerTheme;
}

export default component$((props: FooterProps) => {
  useStylesScoped$(styles);

  const speakState = useSpeakContext();

  const links = [
    {
      label: t('footer.menu.examples@@Examples'),
      href: 'https://github.com/module-federation/module-federation-examples',
    },
    {
      label: t('footer.menu.practical-guide@@Practical guide'),
      href: 'https://module-federation.myshopify.com/products/practical-module-federation',
    },
    {
      label: t('footer.menu.medusa@@Try Medusa'),
      href: 'https://app.medusa.codes/',
    },
    {
      label: t('footer.menu.documentation@@Documentation'),
      href: 'https://module-federation.io/en/ipt/2.5/',
    },
    {
      label: t('footer.menu.sponsor@@Become a sponsor'),
      href: 'https://opencollective.com/module-federation-universe',
    },
  ];

  return (
    <Container theme={props.theme || ContainerTheme.OPAQUE}>
      <footer class="flex flex-col items-center py-28 gap-10">
        <img
          src="/module-federation-logo.svg"
          class="h-10"
          alt="Flowbite Logo"
        />

        <div class="flex items-center justify-center flex-wrap gap-y-4 gap-x-10">
          {links.map((link) => {
            return (
              <a class="font-medium text-lg" href={link.href}>
                {link.label}
              </a>
            );
          })}
        </div>
      </footer>
    </Container>
  );
});
