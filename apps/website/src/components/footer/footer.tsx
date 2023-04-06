import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t, useSpeakContext } from 'qwik-speak';
import Container, { ContainerTheme } from '../container/container';

import styles from './footer.css?inline';
import Button, { ButtonPropsTarget, ButtonTheme } from '../button/button';

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
      target: '_blank' as ButtonPropsTarget,
    },
    {
      label: t('footer.menu.practical-guide@@Practical guide'),
      href: 'https://module-federation.myshopify.com/products/practical-module-federation',
      target: '_blank' as ButtonPropsTarget,
    },
    {
      label: t('footer.menu.medusa@@Try Medusa'),
      href: 'https://app.medusa.codes/',
      target: '_blank' as ButtonPropsTarget,
    },
    {
      label: t('footer.menu.documentation@@Documentation'),
      href: 'https://module-federation.io/en/ipt/2.5/',
      target: '_blank' as ButtonPropsTarget,
    },
    {
      label: t('footer.menu.sponsor@@Become a sponsor'),
      href: 'https://opencollective.com/module-federation-universe',
      target: '_blank' as ButtonPropsTarget,
    },
  ];

  return (
    <Container theme={props.theme || ContainerTheme.OPAQUE}>
      <footer class="flex flex-col items-center py-28 gap-10">
        <img
          src="/module-federation-logo.svg"
          class="h-10"
          alt="Module Federation Logo"
        />

        <div class="flex items-center justify-center flex-wrap gap-y-4 gap-x-10">
          {links.map((link) => {
            return (
              <Button
                href={link.href}
                type="link"
                theme={ButtonTheme.NAKED_ALT}
              >
                {link.label}
              </Button>
            );
          })}
        </div>
      </footer>
    </Container>
  );
});
