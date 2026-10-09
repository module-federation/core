export interface RemoteCardProps {
  loadPath: string;
  onStateChange: (state: SharedStateView) => void;
}

export interface SharedStateView {
  count: number;
  instanceId: string;
  lastSource: string;
  revision: number;
}

export type RemoteDetailsProps = Record<string, never>;

export type ActivityFilter = 'all' | 'runtime' | 'state';

export interface ActivityEntry {
  id: string;
  category: Exclude<ActivityFilter, 'all'>;
  detail: string;
  time: string;
  title: string;
}

export interface ActivityFeedProps {
  entries: ActivityEntry[];
  filter: ActivityFilter;
  onFilterChange: (filter: ActivityFilter) => void;
}
