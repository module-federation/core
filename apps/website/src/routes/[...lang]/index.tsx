import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import HeroSection from '../../components/sections/hero/hero';
import ExploreSection from '../../components/sections/explore/explore';
import DiscordSection from '../../components/sections/discord/discord';
import DocSummarySection from '../../components/sections/doc-summary/doc-summary';
import EvolvingSection from '../../components/sections/evolving/evolving';
import SubscribeSection from '../../components/sections/subscribe/subscribe';
import ShowcaseSection from '../../components/sections/showcase/showcase';
import MedusaSection from '../../components/sections/medusa/medusa';
import ContactSection from '../../components/sections/contact/contact';
import BannerSection from '../../components/sections/banner/banner';
import BrandsSection from '../../components/sections/brands/brands';
import SponsorSection from '../../components/sections/sponsor/sponsor';

export default component$(() => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <ExploreSection />
      <DiscordSection />
      <DocSummarySection />
      <EvolvingSection />
      <SubscribeSection />
      <BrandsSection />
      <ShowcaseSection />
      <MedusaSection />
      <BannerSection />
      <ContactSection />
      <SponsorSection />
      <Footer />
    </>
  );
});

export const head: DocumentHead = {
  title: 'app.title',
  meta: [
    {
      name: 'description',
      content: 'app.meta.description',
    },
    {
      property: 'og:image',
      content: '/default-og.png',
    },
  ],
};
