import { component$, useStylesScoped$ } from '@builder.io/qwik';
import Button, { ButtonTheme } from '../../button/button';
import Card from '../../card/card';
import Section from '../../section/section';
import styles from './explore.css?inline';

export const cards = [
  {
    iconSrc: 'illustrations/pratical-module-federation.svg',
    title: 'Practical Module Federation',
    actionText: 'Get the book',
    actionHref: '#',
  },
  {
    iconSrc: 'illustrations/implementing-module-federation.svg',
    title: 'Implementing Module Federation',
    actionText: 'Learn more',
    actionHref: '#',
  },
  {
    iconSrc: 'illustrations/conference-talks.svg',
    title: 'Conference talks',
    actionText: 'Watch now',
    actionHref: '#',
  },
  {
    iconSrc: 'illustrations/community-content.svg',
    title: 'Community content',
    actionText: 'Find out more',
    actionHref: '#',
  },
];

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Section>
      <div class="flex flex-col gap-3">
        <div class="grid grid-rows-2 grid-flow-col gap-3">
          {cards.map((card) => {
            return (
              <Card>
                <div class="flex items-center p-12 gap-6">
                  <img class="h-16 w-16" src={card.iconSrc} alt={card.title} />

                  <div class="flex flex-col items-start gap-1">
                    <h3 class="text-blue-grey-900 font-semibold text-xl">
                      {card.title}
                    </h3>
                    <Button
                      theme={ButtonTheme.NAKED}
                      href={card.actionHref}
                      type="link"
                    >
                      {card.actionText}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div class="last-row">
          <Card>
            <div class="flex items-start p-12 gap-6 max-w-2xl mx-auto">
              <img
                class="h-24 w-24"
                src="illustrations/module-federation-courses.svg"
                alt="Module Federation courses"
              />

              <div class="flex flex-col items-start gap-6">
                <div class="flex flex-col items-start gap-1">
                  <h3 class="text-blue-grey-900 font-semibold text-xl">
                    Module Federation courses
                  </h3>
                  <p class="font-medium text-blue-grey-900 text-lg">
                    Gain expertise in Module Federation and enhance your skills
                    now
                  </p>
                </div>
                <Button theme={ButtonTheme.SOLID} href="#" type="link">
                  Start exploring
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
});
