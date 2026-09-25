import { useCallback, useEffect, useState } from '@lynx-js/react';
import { instanceId, snapshot, token } from 'orbit-shared-state';

import type { ActivityFeedProps, ActivityFilter } from './contracts';
import './Remote.css';

const FILTERS: Array<{ id: ActivityFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'runtime', label: 'Runtime' },
  { id: 'state', label: 'Shared state' },
];

const loadActivityMetadata = () => {
  'background-only';
  return import(
    /* webpackChunkName: 'activity-metadata' */ './activityMetadata'
  );
};

export function ActivityFeed({
  entries,
  filter,
  onFilterChange,
}: ActivityFeedProps) {
  const sharedState = snapshot();
  const [metadata, setMetadata] = useState('Loading nested module');
  const selectFilter = useCallback(
    (nextFilter: ActivityFilter) => {
      'background-only';
      onFilterChange(nextFilter);
    },
    [onFilterChange],
  );
  useEffect(() => {
    'background-only';
    let mounted = true;
    void loadActivityMetadata().then(
      (module) => {
        if (mounted) setMetadata(module.activityMetadata);
      },
      () => {
        if (mounted) setMetadata('Nested federated module failed');
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  const visibleEntries =
    filter === 'all'
      ? entries
      : entries.filter((entry) => entry.category === filter);

  return (
    <view className="ActivityPanel" data-testid="remote-activity-feed">
      <view className="RemotePanelHeader">
        <text className="RemotePanelTitle">Federated activity</text>
        <text className="RemoteStatusText" data-testid="shared-activity-count">
          SHARED COUNT {sharedState.count}
        </text>
        <text
          className="RemoteStatusText"
          data-testid="activity-metadata"
          accessibility-element
          accessibility-label={metadata}
          ios-platform-accessibility-id="activity-metadata"
        >
          {metadata}
        </text>
      </view>
      <view className="FilterRow">
        {FILTERS.map((item) => (
          <view
            className={
              item.id === filter
                ? 'FilterButton FilterButtonActive'
                : 'FilterButton'
            }
            data-testid={`filter-${item.id}`}
            key={item.id}
            bindtap={() => selectFilter(item.id)}
          >
            <text
              className={
                item.id === filter
                  ? 'FilterText FilterTextActive'
                  : 'FilterText'
              }
            >
              {item.label}
            </text>
          </view>
        ))}
      </view>

      <list list-type="single" className="ActivityList">
        {visibleEntries.map((entry) => (
          <list-item
            className="ActivityRow"
            item-key={entry.id}
            key={entry.id}
            reuse-identifier="orbit-activity-row"
          >
            <view
              className={
                entry.category === 'state'
                  ? 'ActivityMarker ActivityMarkerState'
                  : 'ActivityMarker'
              }
            />
            <view className="ActivityCopy">
              <view className="ActivityTopline">
                <text className="ActivityTitle">{entry.title}</text>
                <text className="ActivityTime">{entry.time}</text>
              </view>
              <text className="ActivityDetail">{entry.detail}</text>
            </view>
          </list-item>
        ))}
      </list>

      {visibleEntries.length === 0 ? (
        <view className="EmptyActivity">
          <text className="EmptyActivityText">No activity in this filter.</text>
        </view>
      ) : null}
    </view>
  );
}

export const sharedInstance = () => instanceId;
export const sharedSnapshot = snapshot;
export const sharedToken = () => token;

export default ActivityFeed;
