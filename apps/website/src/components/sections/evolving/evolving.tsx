import { component$, useStylesScoped$ } from '@builder.io/qwik';
import Button, { ButtonTheme } from '../../button/button';
import Card from '../../card/card';
import Section, { SectionHeader } from '../../section/section';
import styles from './evolving.css?inline';

export const cards = [
  {
    title: 'RFCs',
    subtitle:
      'Participate in the community discussions to decide on what features are coming next',
    actionText: 'Get the book!',
    actionHref: '#',
  },
  {
    title: 'Module Federation Roadmap',
    subtitle: 'Discover the future of Module Federation',
    actionText: 'Get the book!',
    actionHref: '#',
  },
];

export const bundlers = [
  {
    logo: 'bundlers/webpack.svg',
    name: 'Webpack',
    actionHref: '#',
  },
  {
    logo: 'bundlers/rspack.svg',
    name: 'Rspack',
    actionHref: '#',
  },
  {
    logo: 'bundlers/vite.svg',
    name: 'Vite',
    actionHref: '#',
  },
  {
    logo: 'bundlers/rollup.svg',
    name: 'Rollup',
    actionHref: '#',
  },
  {
    logo: 'bundlers/esbuild.svg',
    name: 'esBuild',
    actionHref: '#',
  },
];

// TODO: Check why #00B9FF is not on collor pallete
export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Section>
      <SectionHeader
        q:slot="header"
        title="Evolving Module Federation"
        subtitle="The world of Module Federation is constantly evolving and growing based on the feedback from the community. The RFCs are open for all to participate in the discussion and the roadmap is published."
      />
      <div class="flex flex-col gap-3">
        <div class="grid grid-cols-2 gap-3">
          {cards.map((card) => {
            return (
              <Card>
                <div class="flex flex-col h-full p-10 gap-6">
                  <h3 class="text-blue-grey-900 font-semibold text-3xl">
                    {card.title}
                  </h3>
                  <p class="font-medium text-blue-grey-900 text-lg">
                    {card.subtitle}
                  </p>

                  <div class="mt-auto">
                    <Button
                      theme={ButtonTheme.SOLID}
                      href={card.actionHref}
                      type="link"
                      small
                    >
                      {card.actionText}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <Card>
          <div class="flex flex-col justify-center items-center p-10 gap-6">
            <h3 class="text-blue-grey-900 font-semibold text-3xl">
              Supported bundlers
            </h3>
            <div class="flex justify-center w-full gap-24">
              {bundlers.map((bundler) => {
                return (
                  <a
                    class="flex flex-col items-center "
                    href={bundler.actionHref}
                  >
                    <img class="w-24 h-24" src={bundler.logo} alt={bundler.name} />
                    <div class="text-2xl font-semibold text-[#00B9FF] underline decoration-solid decoration-1 underline-offset-2">
                      {bundler.name}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
});
