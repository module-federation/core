import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t } from 'qwik-speak';

import Button, { ButtonPropsTarget, ButtonTheme } from '../../button/button';
import Card from '../../card/card';
import { ContainerTheme } from '../../container/container';
import { IconName } from '../../icon/data';
import Icon from '../../icon/icon';
import Section, { SectionPadding } from '../../section/section';
import styles from './explore.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  const cards = [
    {
      iconSrc: '/illustrations/pratical-module-federation.svg',
      title: t(
        'explore.cards.practical-module-federation.title@@Practical Module Federation',
      ),
      actionText: t(
        'explore.cards.practical-module-federation.action@@Get the book',
      ),
      actionHref:
        'https://module-federation.myshopify.com/products/practical-module-federation',
      target: '_blank' as ButtonPropsTarget,
    },
    {
      iconSrc: '/illustrations/implementing-module-federation.svg',
      title: t(
        'explore.cards.implementing-module-federation.title@@Implementing Module Federation',
      ),
      actionText: t(
        'explore.cards.implementing-module-federation.action@@Learn more',
      ),
      actionHref: 'https://module-federation.io/en/mf-docs/0.2/setup',
      target: '_blank' as ButtonPropsTarget,
    },
    {
      iconSrc: '/illustrations/conference-talks.svg',
      title: t('explore.cards.conference-talks.title@@Conference talks'),
      actionText: t('explore.cards.conference-talks.action@@Watch now'),
      actionHref: '#',
      actionDisabled: true,
      target: '_blank' as ButtonPropsTarget,
    },
    {
      iconSrc: '/illustrations/community-content.svg',
      title: t('explore.cards.community-content.title@@Community content'),
      actionText: t('explore.cards.community-content.action@@Find out more'),
      actionHref: '#',
      actionDisabled: true,
      target: '_blank' as ButtonPropsTarget,
    },
  ];

  return (
    <Section
      padding={SectionPadding.BOTTOM}
      id="discover"
      class="scroll-mt-32"
      theme={ContainerTheme.OPAQUE}
    >
      <div class="flex flex-col gap-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cards.map((card) => {
            return (
              <Card hover key={card.title}>
                <div class="flex items-center px-6 py-8 md:p-12 gap-6">
                  <img class="h-16 w-16" src={card.iconSrc} alt={card.title} />

                  <div class="flex flex-col items-start gap-2 md:gap-1">
                    <h3 class="text-blue-gray-900 font-semibold text-xl">
                      {card.title}
                    </h3>
                    <Button
                      theme={ButtonTheme.NAKED}
                      href={card.actionHref}
                      target={card.target}
                      disabled={card.actionDisabled}
                      type="link"
                    >
                      {card.actionDisabled
                        ? t('explore.disabled')
                        : card.actionText}

                      {!card.actionDisabled && (
                        <Icon
                          q:slot="suffix"
                          name={IconName.ARROW_NARROW_RIGHT}
                          size="24px"
                        />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div class="flex">
          <Card hover>
            <div class="items-start p-12 gap-6 max-w-2xl mx-auto hidden md:flex">
              <img
                class="h-14 w-14 md:h-24 md:w-24"
                src="/illustrations/module-federation-courses.svg"
                alt="Module Federation courses"
              />

              <div class="flex flex-col items-start gap-6">
                <div class="flex flex-col items-start gap-1">
                  <h3 class="text-blue-gray-900 font-semibold text-xl">
                    {t(
                      'explore.cards.module-federation-courses.title@@Module Federation courses',
                    )}
                  </h3>
                  <p class="font-medium text-blue-gray-900 text-lg">
                    {t(
                      'explore.cards.module-federation-courses.subtitle@@Gain expertise in Module Federation and enhance your skills now',
                    )}
                  </p>
                </div>

                <Button
                  class="mt-2"
                  theme={ButtonTheme.NAKED}
                  href="#"
                  target="_blank"
                  type="link"
                  disabled
                >
                  {t('explore.disabled')}
                  {/* {t(
                    'explore.cards.module-federation-courses.action@@Start exploring'
                  )}

                  <Icon
                    q:slot="suffix"
                    name={IconName.ARROW_NARROW_RIGHT}
                    size="24px"
                  /> */}
                </Button>
              </div>
            </div>
            <div class="flex flex-col md:hidden px-6 py-8 gap-6">
              <div class="flex items-start gap-6">
                <img
                  class="h-16 w-16"
                  src="/illustrations/module-federation-courses.svg"
                  alt="Module Federation courses"
                />

                <div class="flex flex-col items-start gap-2 md:gap-1">
                  <h3 class="text-blue-gray-900 font-semibold text-xl">
                    {t(
                      'explore.cards.module-federation-courses.title@@Module Federation courses',
                    )}
                  </h3>
                  <p class="font-medium text-blue-gray-900 text-lg">
                    {t(
                      'explore.cards.module-federation-courses.subtitle@@Gain expertise in Module Federation and enhance your skills now',
                    )}
                  </p>
                </div>
              </div>
              <Button
                theme={ButtonTheme.NAKED}
                href="#"
                type="link"
                target="_blank"
                disabled
              >
                {t('explore.disabled')}
                {/* {t(
                  'explore.cards.module-federation-courses.action@@Start exploring'
                )}

                <Icon
                  q:slot="suffix"
                  name={IconName.ARROW_NARROW_RIGHT}
                  size="24px"
                /> */}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
});
