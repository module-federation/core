import { useCallback, useState } from '@lynx-js/react';

import type { SharedStateView } from '../remote-ui/contracts';
import { type LoadState, useFederatedCatalog } from './useFederatedCatalog';
import './App.css';

type Screen = 'overview' | 'activity' | 'modules' | 'settings';

const NAVIGATION: Array<{ id: Screen; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'modules', label: 'Modules' },
  { id: 'settings', label: 'Settings' },
];

const MODULES = [
  { name: 'Card', path: "import('catalog/Card')" },
  { name: 'Details', path: "import('catalog/Details')" },
  { name: 'ActivityFeed', path: "loadRemote('catalog/ActivityFeed')" },
];

function LoadButton({ state, onTap }: { state: LoadState; onTap: () => void }) {
  const label =
    state === 'loading'
      ? 'Loading catalog…'
      : state === 'ready'
        ? 'Catalog connected'
        : state === 'error'
          ? 'Retry catalog'
          : 'Load remote catalog';
  const stateClass =
    state === 'loading'
      ? 'PrimaryAction PrimaryActionLoading'
      : state === 'ready'
        ? 'PrimaryAction PrimaryActionReady'
        : state === 'error'
          ? 'PrimaryAction PrimaryActionError'
          : 'PrimaryAction';

  return (
    <view
      accessibility-element
      accessibility-label={label}
      accessibility-traits="button"
      className={stateClass}
      bindtap={onTap}
      data-testid="load-remotes"
    >
      <text className="PrimaryActionText">{label}</text>
      <text className="PrimaryActionMeta">MF MANIFEST · HTTP</text>
    </view>
  );
}

function DeliveryHealth({ ready }: { ready: boolean }) {
  return (
    <view className="HealthPanel" data-testid="delivery-health">
      <view className="PanelHeader">
        <text className="PanelTitle">Delivery health</text>
        <text className="PanelMeta">
          {ready ? '3 MODULES ONLINE' : 'CONNECTING'}
        </text>
      </view>
      <view className="HealthGrid">
        <view className="HealthCell">
          <text className="HealthCellValue">{ready ? 'Ready' : 'Wait'}</text>
          <text className="HealthCellLabel">Catalog remote</text>
        </view>
        <view className="HealthCell">
          <text className="HealthCellValue">JSON</text>
          <text className="HealthCellLabel">MF manifest</text>
        </view>
        <view className="HealthCell">
          <text className="HealthCellValue">HTTP</text>
          <text className="HealthCellLabel">Lynx bundle</text>
        </view>
      </view>
    </view>
  );
}

function ModuleList({ ready }: { ready: boolean }) {
  return (
    <view className="ModuleList" data-testid="module-list">
      {MODULES.map((module, index) => (
        <view
          className={
            index === MODULES.length - 1
              ? 'ModuleRow ModuleRowLast'
              : 'ModuleRow'
          }
          key={module.name}
        >
          <view className="ModuleCopy">
            <text className="ModuleName">{module.name}</text>
            <text className="ModulePath">{module.path}</text>
          </view>
          <text className="ModuleStatus">{ready ? 'READY' : 'PENDING'}</text>
        </view>
      ))}
    </view>
  );
}

function SingletonProof({
  ready,
  shared,
  state,
}: {
  ready: boolean;
  shared: boolean;
  state: SharedStateView;
}) {
  return (
    <view className="SingletonProof" data-testid="singleton-proof">
      <view className="SingletonProofCopy">
        <text className="SingletonProofLabel">HOST OBSERVER</text>
        <text className="SingletonProofValue" data-testid="shared-host-count">
          {state.count}
        </text>
      </view>
      <view className="SingletonProofCopy SingletonProofCopyWide">
        <text className="SingletonProofLabel">REALM-LOCAL IDENTITY</text>
        <text
          className={
            ready && shared
              ? 'SingletonProofStatus SingletonProofStatusReady'
              : 'SingletonProofStatus'
          }
          data-testid="singleton-status"
          accessibility-element
          accessibility-label={
            ready
              ? shared
                ? 'Shared singleton verified'
                : 'Singleton identity mismatch'
              : 'Waiting for remote observers'
          }
        >
          {ready
            ? shared
              ? 'Shared singleton verified'
              : 'Singleton identity mismatch'
            : 'Waiting for remote observers'}
        </text>
      </view>
    </view>
  );
}

export function App() {
  const [screen, setScreen] = useState<Screen>('overview');
  const {
    ActivityFeedComponent,
    CardComponent,
    DetailsComponent,
    activity,
    filter,
    handleHostIncrement,
    handleRemoteStateChange,
    handleReset,
    loadError,
    loadFederatedSurface,
    loadState,
    selectFilter,
    sharedState,
    singletonShared,
  } = useFederatedCatalog();

  const selectScreen = useCallback((nextScreen: Screen) => {
    'background-only';
    setScreen(nextScreen);
  }, []);

  const renderActivity = () =>
    ActivityFeedComponent ? (
      <ActivityFeedComponent
        entries={activity}
        filter={filter}
        onFilterChange={selectFilter}
      />
    ) : (
      <view className="RemoteFallback">
        <text className="RemoteFallbackText">
          The runtime-loaded activity feed will appear after the catalog
          manifest resolves.
        </text>
      </view>
    );

  return (
    <view className="Page" data-testid="orbit-control-app">
      <view className="TopBar">
        <view className="Brand">
          <view className="BrandMark">
            <text className="BrandMarkText">O</text>
          </view>
          <text className="BrandName">Orbit Control</text>
        </view>
        <view className="Connection">
          <view className="ConnectionDot" />
          <text className="ConnectionText">Connected</text>
        </view>
      </view>

      <scroll-view className="Content" scroll-y>
        <view className="Screen">
          <view className="Hero">
            <text className="HeroTitle">Federated workspace</text>
            <text className="HeroCopy">
              Live modules, shared state, and delivery health in one native Lynx
              surface.
            </text>
          </view>

          <LoadButton state={loadState} onTap={loadFederatedSurface} />
          <view className="LoadEvidence">
            <text
              className={
                loadState === 'ready'
                  ? 'LoadEvidenceText LoadEvidenceReady'
                  : 'LoadEvidenceText'
              }
              data-testid="import-status"
            >
              Compiled imports {loadState === 'ready' ? 'ready' : loadState}
            </text>
            <text
              className={
                loadState === 'ready'
                  ? 'LoadEvidenceText LoadEvidenceReady'
                  : 'LoadEvidenceText'
              }
              data-testid="runtime-status"
            >
              Runtime API {loadState === 'ready' ? 'ready' : loadState}
            </text>
          </view>
          {loadError ? (
            <text className="LoadError" data-testid="load-error">
              {loadError}
            </text>
          ) : null}
          <SingletonProof
            ready={loadState === 'ready'}
            shared={singletonShared}
            state={sharedState}
          />

          {screen === 'overview' ? (
            <>
              <DeliveryHealth ready={loadState === 'ready'} />
              {CardComponent ? (
                <CardComponent
                  loadPath="import('catalog/Card')"
                  onStateChange={handleRemoteStateChange}
                />
              ) : (
                <view className="RemoteFallback">
                  <text className="RemoteFallbackText">
                    Loading the shared state card through a standard federated
                    import.
                  </text>
                </view>
              )}
              {DetailsComponent ? <DetailsComponent /> : null}
              <view className="SectionHeader">
                <text className="SectionTitle">Live activity</text>
                <text className="SectionMeta">RUNTIME API</text>
              </view>
              {renderActivity()}
            </>
          ) : null}

          {screen === 'activity' ? (
            <>
              <view className="SectionHeader">
                <text className="SectionTitle">Activity timeline</text>
                <text className="SectionMeta">{activity.length} EVENTS</text>
              </view>
              {renderActivity()}
              <view className="QuickActions">
                <view
                  className="SecondaryAction"
                  bindtap={handleHostIncrement}
                  data-testid="activity-increment"
                >
                  <text className="SecondaryActionText">Add state event</text>
                </view>
                <view
                  className="SecondaryAction"
                  bindtap={handleReset}
                  data-testid="reset-feed"
                >
                  <text className="SecondaryActionText">Reset feed</text>
                </view>
              </view>
            </>
          ) : null}

          {screen === 'modules' ? (
            <>
              <view className="SectionHeader">
                <text className="SectionTitle">Remote modules</text>
                <text className="SectionMeta">CATALOG</text>
              </view>
              <ModuleList ready={loadState === 'ready'} />
            </>
          ) : null}

          {screen === 'settings' ? (
            <>
              <view className="SectionHeader">
                <text className="SectionTitle">Runtime settings</text>
                <text className="SectionMeta">READ ONLY</text>
              </view>
              <view className="SettingsPanel" data-testid="runtime-settings">
                <text className="SettingsTitle">Lynx federation</text>
                <text className="SettingsLabel">REMOTE ENTRY</text>
                <text className="SettingsValue">
                  catalog@mf-manifest.json · HTTP
                </text>
                <text className="SettingsLabel">REMOTE BUNDLE</text>
                <text className="SettingsValue">
                  External .lynx.bundle container
                </text>
                <text className="SettingsLabel">LAYERS</text>
                <text className="SettingsValue">
                  Background and main thread, isolated per realm
                </text>
                <text className="SettingsLabel">LAST ERROR</text>
                <text className="SettingsValue">{loadError || 'None'}</text>
              </view>
            </>
          ) : null}
        </view>
      </scroll-view>

      <view className="BottomNav">
        {NAVIGATION.map((item) => (
          <view
            className="NavItem"
            data-active={screen === item.id ? 'true' : 'false'}
            data-testid={`nav-${item.id}`}
            key={item.id}
            bindtap={() => selectScreen(item.id)}
          >
            <view
              className={
                screen === item.id
                  ? 'NavIndicator NavIndicatorActive'
                  : 'NavIndicator'
              }
            />
            <text
              className={
                screen === item.id ? 'NavLabel NavLabelActive' : 'NavLabel'
              }
            >
              {item.label}
            </text>
          </view>
        ))}
      </view>
    </view>
  );
}
