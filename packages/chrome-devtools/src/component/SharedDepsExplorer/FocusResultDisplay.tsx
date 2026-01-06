import React from 'react';
import { Tag } from '@arco-design/web-react';
import { LoadedStatus } from './share-utils';

interface FocusResult {
  packageName: string;
  version: string;
  status: LoadedStatus;
  providers: string[];
}

interface FocusResultDisplayProps {
  focusResult: FocusResult | null;
  hasData: boolean;
  loadedStatusLabel: (status: LoadedStatus) => string;
}

const FocusResultDisplay: React.FC<FocusResultDisplayProps> = ({
  focusResult,
  hasData,
  loadedStatusLabel,
}) => {
  if (focusResult) {
    return (
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px]">
            {focusResult.packageName}@{focusResult.version}
          </span>
          <Tag size="small" className="loaded-status-tag">
            {loadedStatusLabel(focusResult.status)}
          </Tag>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-[11px] text-zinc-700">
          <span className="text-zinc-500">Provider: </span>
          {focusResult.providers.map((p) => (
            <span
              key={p}
              className="rounded bg-white px-1.5 py-0.5 font-medium text-zinc-800 shadow-sm"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (hasData) {
    return (
      <p className="text-[11px] text-zinc-500">
        No version matching the criteria was found in the current shared data.
        Please check if the package name / version is correct.
      </p>
    );
  }

  return (
    <p className="text-[11px] text-zinc-500">
      No shared dependency data loaded yet.
    </p>
  );
};

export default FocusResultDisplay;
