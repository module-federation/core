import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t } from 'qwik-speak';
import { useLocalizedUrl } from '../../speak-config';
import Container, { ContainerTheme } from '../container/container';

import styles from './footer.css?inline';

export interface FooterProps {
  theme?: ContainerTheme;
}

export default component$((props: FooterProps) => {
  useStylesScoped$(styles);
  const localizedUrl = useLocalizedUrl();

  const links = [
    {
      label: t('footer.menu.examples@@Examples'),
      href: localizedUrl('/showcase'),
    },
    // { label: t('footer.menu.practical-guide@@Practical guide'), href: '#' },
    {
      label: t('footer.menu.medusa@@Try Medusa'),
      href: localizedUrl('/#medusa'),
    },
    { label: t('footer.menu.documentation@@Documentation'), href: '#' },
    {
      label: t('footer.menu.sponsor@@Become a sponsor'),
      href: localizedUrl('/#sponsor'),
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
