import { useCallback, useState } from '@lynx-js/react';

import { snapshot } from 'orbit-shared-state';
import { ActivityFeed } from '../remote-ui/ActivityFeed';
import { Card } from '../remote-ui/Card';
import type {
  ActivityEntry,
  ActivityFilter,
  SharedStateView,
} from '../remote-ui/contracts';
import { Details } from '../remote-ui/Details';
import './CatalogApp.css';

const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: 'catalog-boot',
    category: 'runtime',
    detail: 'Rspeedy launched the Catalog as its own ReactLynx product.',
    time: 'NOW',
    title: 'Catalog app launched',
  },
  {
    id: 'catalog-exposes',
    category: 'runtime',
    detail: 'Card, Details, and ActivityFeed are also published as exposes.',
    time: 'NOW',
    title: 'Federation surface ready',
  },
];

const EXPOSES = [
  { name: 'Card', path: 'catalog/Card' },
  { name: 'Details', path: 'catalog/Details' },
  { name: 'ActivityFeed', path: 'catalog/ActivityFeed' },
];

export function CatalogApp() {
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [sharedState, setSharedState] = useState(snapshot());

  const handleStateChange = useCallback((nextState: SharedStateView) => {
    'background-only';
    setSharedState(nextState);
    setActivity((entries) => [
      {
        id: `catalog-state-${nextState.revision}`,
        category: 'state',
        detail: `The standalone Card updated the local singleton to ${nextState.count}.`,
        time: 'NOW',
        title: 'Shared state changed',
      },
      ...entries,
    ]);
  }, []);

  const selectFilter = useCallback((nextFilter: ActivityFilter) => {
    'background-only';
    setFilter(nextFilter);
  }, []);

  return (
    <view className="CatalogPage" data-testid="catalog-standalone-app">
      <view className="CatalogTopBar">
        <view className="CatalogBrand">
          <view className="CatalogBrandMark">
            <text className="CatalogBrandMarkText">C</text>
          </view>
          <view className="CatalogBrandCopy">
            <text className="CatalogBrandName">Orbit Catalog</text>
            <text className="CatalogBrandMeta">REMOTE PRODUCT</text>
          </view>
        </view>
        <view className="CatalogLiveBadge">
          <view className="CatalogLiveDot" />
          <text
            accessibility-element
            accessibility-label="Standalone catalog ready"
            className="CatalogLiveText"
            data-testid="catalog-standalone-ready"
            ios-platform-accessibility-id="catalog-standalone-ready"
          >
            LIVE
          </text>
        </view>
      </view>

      <scroll-view className="CatalogContent" scroll-y>
        <view className="CatalogScreen">
          <view className="CatalogHero">
            <text className="CatalogEyebrow">STANDALONE + FEDERATED</text>
            <text className="CatalogHeroTitle">
              One product, three exports.
            </text>
            <text className="CatalogHeroCopy">
              This app runs on its own. Orbit Control imports the exact same
              components from its manifest over HTTP.
            </text>
          </view>

          <view className="CatalogProof" data-testid="catalog-product-proof">
            <view className="CatalogProofMetric">
              <text className="CatalogProofValue">3</text>
              <text className="CatalogProofLabel">EXPOSED MODULES</text>
            </view>
            <view className="CatalogProofDivider" />
            <view className="CatalogProofMetric CatalogProofMetricWide">
              <text
                className="CatalogProofValue"
                data-testid="catalog-local-count"
              >
                {sharedState.count}
              </text>
              <text className="CatalogProofLabel">LOCAL SHARED COUNT</text>
            </view>
            <view className="CatalogProofDivider" />
            <view className="CatalogProofMetric CatalogProofMetricWide">
              <text className="CatalogProofValue CatalogProofValueSmall">
                NATIVE
              </text>
              <text className="CatalogProofLabel">LYNX + WEB</text>
            </view>
          </view>

          <view className="CatalogSectionHeader">
            <text className="CatalogSectionTitle">Published surface</text>
            <text className="CatalogSectionMeta">MF MANIFEST</text>
          </view>
          <view className="CatalogExposeList">
            {EXPOSES.map((expose, index) => (
              <view
                className={
                  index === EXPOSES.length - 1
                    ? 'CatalogExposeRow CatalogExposeRowLast'
                    : 'CatalogExposeRow'
                }
                key={expose.name}
              >
                <view className="CatalogExposeIcon">
                  <text className="CatalogExposeIconText">
                    {expose.name.slice(0, 1)}
                  </text>
                </view>
                <view className="CatalogExposeCopy">
                  <text className="CatalogExposeName">{expose.name}</text>
                  <text className="CatalogExposePath">{expose.path}</text>
                </view>
                <text className="CatalogExposeStatus">EXPOSED</text>
              </view>
            ))}
          </view>

          <view className="CatalogSectionHeader">
            <text className="CatalogSectionTitle">Local composition</text>
            <text className="CatalogSectionMeta">DIRECT IMPORTS</text>
          </view>
          <Card
            loadPath="local Catalog app import"
            onStateChange={handleStateChange}
          />
          <Details />

          <view className="CatalogSectionHeader CatalogActivityHeader">
            <text className="CatalogSectionTitle">Product activity</text>
            <text className="CatalogSectionMeta">SHARED FUNCTIONALITY</text>
          </view>
          <ActivityFeed
            entries={activity}
            filter={filter}
            onFilterChange={selectFilter}
          />

          <view className="CatalogFooter">
            <text className="CatalogFooterTitle">Built once with Rspeedy</text>
            <text className="CatalogFooterCopy">
              Launch main.lynx.bundle as this app, or consume the three lazy
              exposes through mf-manifest.json.
            </text>
          </view>
        </view>
      </scroll-view>
    </view>
  );
}
