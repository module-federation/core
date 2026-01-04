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
  loadedStatusColor: (status: LoadedStatus) => string;
  loadedStatusLabel: (status: LoadedStatus) => string;
}

const FocusResultDisplay: React.FC<FocusResultDisplayProps> = ({
  focusResult,
  hasData,
  loadedStatusColor,
  loadedStatusLabel,
}) => {
  if (focusResult) {
    return (
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px]">
            {focusResult.packageName}@{focusResult.version}
          </span>
          <Tag color={loadedStatusColor(focusResult.status)} size="small">
            {loadedStatusLabel(focusResult.status)}
          </Tag>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-[11px] text-zinc-700">
          <span className="text-zinc-500">提供方 Provider：</span>
          {focusResult.providers.map((p) => (
            <span
              key={p}
              className="rounded bg-white px-1.5 py-0.5 font-medium text-zinc-800 shadow-sm"
            >
              {p}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-zinc-500">
          注意：一个版本理论上可以有多个
          Provider，这里展示的是当前共享图中实际被选中的 Provider 集合。
        </p>
      </div>
    );
  }

  if (hasData) {
    return (
      <p className="text-[11px] text-zinc-500">
        在当前共享数据中没有找到与条件匹配的版本，请确认包名 / 版本是否正确。
      </p>
    );
  }

  return (
    <p className="text-[11px] text-zinc-500">尚未加载任何共享依赖数据。</p>
  );
};

export default FocusResultDisplay;
