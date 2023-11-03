import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { $translate as t } from 'qwik-speak';
import { ContainerTheme } from '../../container/container';
import Section, { SectionHeader } from '../../section/section';
import styles from './banner.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  const title = t('banner.title@@Enterprise Support & Training');

  return (
    <Section
      id="banner"
      class="scroll-mt-32 pb-1"
      theme={ContainerTheme.OPAQUE}
    >
      <SectionHeader q:slot="header" title={title} />
      <div class="flex flex-col lg:flex-row gap-12">
        <div class="flex flex-col items-start justify-center">
          <img
            class="w-195.8 h-113.8 mr-6"
            src="/valor.svg"
            alt={t('ValorSoftware')}
          />
        </div>
        <div class="flex flex-col gap-4 flex-1 w-50">
          <div class="text-blue-gray-900 text-2xl font-medium text-center md:text-left leading-normal">
            {t(
              'banner.text.firstLine@@At Valor, we are delighted to be the exclusive support partners for Module Federation - a technology created by Zack Jackson that has revolutionized modern development.',
            )}
          </div>
          <div class="text-blue-gray-900 text-2xl font-medium text-center md:text-left leading-normal">
            {t(
              "banner.text.secondLine@@Our collaboration and status as core team members has enabled us to reduce the community's reliance on a single individual, as well as bring greater value to OSS.",
            )}
          </div>
        </div>
      </div>
    </Section>
  );
});
