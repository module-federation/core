import { usePageData } from '@rspress/core/runtime';
import { Hero, HomeHero } from '../components/HomeHero';
import { HomeFooter } from '../components/HomeFooter/index';
import { HomeFeature, Feature, FeatureIntro } from '../components/HomeFeature';

export function HomeLayout() {
  const { page } = usePageData();
  const { frontmatter } = page;

  return (
    <div className="mf-home-dark">
      <HomeHero hero={frontmatter.hero as Hero} />
      <HomeFeature
        features={frontmatter.features as Feature[]}
        intro={frontmatter.featureIntro as FeatureIntro}
      />
      <HomeFooter />
    </div>
  );
}
