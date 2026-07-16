import { useCallback } from '@lynx-js/react';
import { instanceId, snapshot, token } from 'orbit-shared-state';

import type { ActivityFeedProps, ActivityFilter } from './contracts';
import './Remote.css';

const FILTERS: Array<{ id: ActivityFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'runtime', label: 'Runtime' },
  { id: 'state', label: 'Shared state' },
];

export function ActivityFeed({
  entries,
  filter,
  onFilterChange,
}: ActivityFeedProps) {
  const sharedState = snapshot();
  const selectFilter = useCallback(
    (nextFilter: ActivityFilter) => {
      'background-only';
      onFilterChange(nextFilter);
    },
    [onFilterChange],
  );

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
