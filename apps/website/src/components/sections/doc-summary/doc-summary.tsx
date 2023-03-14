import { component$, useStylesScoped$ } from '@builder.io/qwik';
import Button, { ButtonTheme } from '../../button/button';
import Card from '../../card/card';
import Section, { SectionHeader } from '../../section/section';

import styles from './doc-summary.css?inline';

export const cards = [
  {
    title: 'Scalability with Module Federation',
    desc: 'Scalability with Module Federation" for a title, and "Module Federation brings scalability to not only code but also individual and organizational productivity',
    actionHref: '#',
    actionTitle: 'Documentation',
  },
  {
    title: 'Modular architecture',
    desc: 'Applications can be split into smaller, self-contained modules that can be developed, tested, and deployed independently.',
    actionHref: '#',
    actionTitle: 'Documentation',
  },
  {
    title: 'Federated runtime',
    desc: 'The modules can be combined and federated at runtime, allowing for greater collaboration and faster development times.',
    actionHref: '#',
    actionTitle: 'Documentation',
  },
  {
    title: 'Flexibility',
    desc: 'Module Federation gives developers the freedom to choose and implement the architecture that best suits their needs, promoting a modular and scalable approach to application development.',
    actionHref: '#',
    actionTitle: 'Documentation',
  },
  {
    title: 'Team collaboration',
    desc: 'Independent teams can be assigned responsibility for specific microfrontends, making it easier to manage the development process and promote collaboration between team members.',
    actionHref: '#',
    actionTitle: 'Documentation',
  },
];

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Section>
      <SectionHeader
        q:slot="header"
        title="Scalability with Module Federation"
        subtitle='Scalability with Module Federation" for a title, and "Module Federation brings scalability to not only code but also individual and organizational productivity'
      />

      <div class="flex flex-col items-center gap-10">
        {cards.map((card) => {
          return (
            <div class="w-full">
              <Card>
                <div class="flex items-center p-10">
                  <div class="flex flex-col gap-4 w-full">
                    <h3 class="text-blue-grey-900 font-bold text-xl">{card.title}</h3>
                    <p class="font-medium text-blue-grey-900 text-lg max-w-3xl">{card.desc}</p>
                  </div>

                  <div>
                    <Button
                      theme={ButtonTheme.NAKED}
                      href={card.actionHref}
                      type="link"
                    >
                      {card.actionTitle}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}

        <Button theme={ButtonTheme.SOLID} href="#" type="link">
          Start using module federation
        </Button>
      </div>
    </Section>
  );
});
