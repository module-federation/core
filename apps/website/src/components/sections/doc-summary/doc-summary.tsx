import { component$, useStylesScoped$ } from '@builder.io/qwik';
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
    <section>
      <h2>Scalability with Module Federation</h2>
      <p>
        Scalability with Module Federation" for a title, and "Module Federation
        brings scalability to not only code but also individual and
        organizational productivity
      </p>

      <div>
        {cards.map((card) => {
          return (
            <div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>

              <div>
                <a href={card.actionHref}>{card.actionTitle}</a>
              </div>
            </div>
          );
        })}
      </div>

      <a href="#">Start using module federation</a>
    </section>
  );
});
