import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import HeroSection from '../components/sections/hero/hero';
import ExploreSection from '../components/sections/explore/explore';
import DiscordSection from '../components/sections/discord/discord';
import DocSummarySection from '../components/sections/doc-summary/doc-summary';

export default component$(() => {
  return (
    <div>
      {/* <HeroSection />
      <ExploreSection />
      <DiscordSection />
      <DocSummarySection /> */}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description',
    },
  ],
};
