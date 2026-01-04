/* eslint-disable prettier/prettier */
import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

import { SharedConfig } from '@module-federation/runtime/types';
import type {
  LoadedStatus,
  NormalizedSharedVersion,
  ReuseStatus,
} from './share-utils';

interface SharedHierarchyChartProps {
  data: NormalizedSharedVersion[];
  selectedScope: string;
}

interface SunburstMeta {
  provider: string;
  scope: string;
  packageName: string;
  version: string;
  from: string;
  useIn: string[];
  loadedStatus: LoadedStatus;
  reuseStatus: ReuseStatus;
  shareConfig: SharedConfig;
}

interface SunburstNode {
  name: string;
  value?: number;
  children?: SunburstNode[];
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  level: 'package' | 'version';
  meta?: SunburstMeta;
}

function getStatusColor(status: LoadedStatus): string {
  if (status === 'loaded') {
    return '#16a34a';
  } // emerald-600
  if (status === 'loading') {
    return '#f59e0b';
  } // amber-500
  return '#9ca3af'; // gray-400
}

function loadedStatusText(status: LoadedStatus | undefined): string {
  if (status === 'loaded') {
    return '已加载';
  }
  if (status === 'loading') {
    return '加载中';
  }
  return '未加载';
}

function buildSunburstData(
  versions: NormalizedSharedVersion[],
): SunburstNode[] {
  if (!versions.length) {
    return [];
  }

  const packagesMap = new Map<string, NormalizedSharedVersion[]>();

  versions.forEach((v) => {
    const list = packagesMap.get(v.packageName);
    if (list) {
      list.push(v);
    } else {
      packagesMap.set(v.packageName, [v]);
    }
  });

  const packageNodes: SunburstNode[] = [];

  packagesMap.forEach((items, pkgName) => {
    if (!items.length) {
      return;
    }

    const versionMap = new Map<string, NormalizedSharedVersion[]>();

    items.forEach((item) => {
      const list = versionMap.get(item.version);
      if (list) {
        list.push(item);
      } else {
        versionMap.set(item.version, [item]);
      }
    });

    const versionNodes: SunburstNode[] = [];

    versionMap.forEach((entries, versionKey) => {
      if (!entries.length) {
        return;
      }
      const base = entries[0];

      const consumersSet = new Set<string>();
      entries.forEach((entry) => {
        if (Array.isArray(entry.useIn)) {
          entry.useIn.forEach((consumer) => {
            if (consumer) {
              consumersSet.add(consumer);
            }
          });
        }
      });
      const consumers = Array.from(consumersSet);
      const value = consumers.length > 0 ? consumers.length : 1;

      let loadedStatus: LoadedStatus = 'not-loaded';
      if (entries.some((e) => e.loadedStatus === 'loaded')) {
        loadedStatus = 'loaded';
      } else if (entries.some((e) => e.loadedStatus === 'loading')) {
        loadedStatus = 'loading';
      }

      const reuseStatus = entries.some((e) => e.reuseStatus === true);

      const itemStyle: SunburstNode['itemStyle'] = {
        color: getStatusColor(loadedStatus),
      };

      if (reuseStatus) {
        itemStyle.borderColor = '#3b82f6'; // blue-500
        itemStyle.borderWidth = 2;
      }

      const providers = Array.from(
        new Set(entries.map((e) => e.provider)),
      ).join(', ');
      const fromProviders = Array.from(
        new Set(entries.map((e) => e.from)),
      ).join(', ');
      const scopes = Array.from(new Set(entries.map((e) => e.scope))).join(
        ', ',
      );

      const meta: SunburstMeta = {
        provider: providers,
        scope: scopes || base.scope,
        packageName: base.packageName,
        version: base.version,
        from: fromProviders,
        useIn: consumers,
        loadedStatus,
        reuseStatus,
        shareConfig: base.shareConfig,
      };

      versionNodes.push({
        name: `v${versionKey}`,
        value,
        itemStyle,
        level: 'version',
        meta,
      });
    });

    if (!versionNodes.length) {
      return;
    }

    const packageValue = versionNodes.reduce(
      (sum, node) => sum + (typeof node.value === 'number' ? node.value : 0),
      0,
    );

    packageNodes.push({
      name: pkgName,
      value: packageValue || 1,
      children: versionNodes,
      level: 'package',
      itemStyle: {
        color: '#e5e7eb', // gray-200
      },
    });
  });

  return packageNodes;
}

function SharedHierarchyChart({
  data,
  selectedScope,
}: SharedHierarchyChartProps) {
  const [selectedMeta, setSelectedMeta] = useState<SunburstMeta | null>(null);

  const scopedData = useMemo(
    () =>
      selectedScope
        ? data.filter((item) => item.scope === selectedScope)
        : data,
    [data, selectedScope],
  );

  const sunburstData = useMemo(
    () => buildSunburstData(scopedData),
    [scopedData],
  );

  const option: EChartsOption = useMemo(() => {
    const hasData = sunburstData.length > 0;

    const baseOption: EChartsOption = {
      tooltip: {
        trigger: 'item',
        confine: true,
        borderWidth: 0,
        backgroundColor: '#0f172a',
        textStyle: {
          color: '#e5e7eb',
          fontSize: 11,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          const node = params.data as SunburstNode;
          const { meta } = node;

          if (!meta) {
            const path = (params.treePathInfo || [])
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((p: any) => p.name)
              .filter(Boolean)
              .join(' / ');

            return `<div style="font-size:12px"><div style="font-weight:600;margin-bottom:2px;">${path}</div><div>合计权重：${params.value ?? '-'}</div></div>`;
          }

          const consumers = Array.isArray(meta.useIn) ? meta.useIn : [];
          const preview = consumers.slice(0, 5);
          const moreCount = consumers.length - preview.length;

          const consumersText = preview.length
            ? preview.join(', ') +
              (moreCount > 0 ? `，等 ${consumers.length} 个` : '')
            : '暂无';

          const cfg = meta.shareConfig || {};
          const cfgPieces: string[] = [];
          if (cfg.requiredVersion) {
            cfgPieces.push(`requiredVersion=${cfg.requiredVersion}`);
          }
          if (cfg.singleton) {
            cfgPieces.push('singleton');
          }
          if (cfg.eager) {
            cfgPieces.push('eager');
          }
          if (cfg.strictVersion) {
            cfgPieces.push('strictVersion');
          }

          const reuseLabel = meta.reuseStatus ? '✓ 复用成功' : '未复用';

          const lines: string[] = [];
          lines.push(
            `<div style="font-weight:600;margin-bottom:4px;">${meta.packageName}@${meta.version}</div>`,
          );
          lines.push(`<div><strong>Provider：</strong>${meta.provider}</div>`);
          lines.push(`<div><strong>Scope：</strong>${meta.scope}</div>`);
          lines.push(
            `<div><strong>真正提供方 from：</strong>${meta.from}</div>`,
          );
          lines.push(
            `<div><strong>加载状态：</strong>${loadedStatusText(meta.loadedStatus)}</div>`,
          );
          lines.push(`<div><strong>复用：</strong>${reuseLabel}</div>`);
          lines.push(
            `<div><strong>Consumers (${consumers.length})：</strong>${consumersText}</div>`,
          );
          if (cfgPieces.length) {
            lines.push(
              `<div><strong>shareConfig：</strong>${cfgPieces.join(', ')}</div>`,
            );
          }

          return `<div style="font-size:12px;">${lines.join('')}</div>`;
        },
      },
      series: [
        {
          type: 'sunburst',
          radius: [0, '90%'],
          sort: undefined,
          nodeClick: 'rootToNode',
          animation: hasData,
          animationDuration: 300,
          animationEasing: 'cubicOut',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: sunburstData as any,
          label: {
            rotate: 'radial',
            color: '#374151',
            fontSize: 10,
            overflow: 'truncate',
            width: 80,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => {
              const node = params.data as SunburstNode;
              if (node.level === 'version' && node.meta) {
                return `${node.meta.packageName}@${node.meta.version}`;
              }
              return params.name;
            },
          },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 1,
          },
        },
      ],
    };

    return baseOption;
  }, [sunburstData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (params: any) => {
    const node = params?.data as SunburstNode | undefined;
    if (node?.meta) {
      setSelectedMeta(node.meta);
    }
  };

  if (!scopedData.length) {
    return (
      <div className="text-[11px] text-zinc-500 py-4">
        当前筛选条件下没有可视化数据，尝试放宽筛选条件。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-xs text-zinc-600">
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
        <span className="font-medium text-zinc-700">图例：</span>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>已加载版本</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span>加载中</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-zinc-400" />
          <span>未加载</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full border border-sky-500" />
          <span>带蓝色描边表示「复用成功」版本</span>
        </div>
      </div>

      <div className="h-80 w-full">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          notMerge
          lazyUpdate
          onEvents={{ click: handleClick }}
        />
      </div>

      {selectedMeta && (
        <div className="rounded-md border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono">
              {selectedMeta.packageName}@{selectedMeta.version}
            </span>
            <span>· Provider：{selectedMeta.provider}</span>
            <span>· Scope：{selectedMeta.scope}</span>
            <span>· from：{selectedMeta.from}</span>
          </div>
          <p className="mt-1 text-zinc-500">
            点击的分段不会改变上方的筛选，仅用于快速查看当前版本的上下文信息。
          </p>
        </div>
      )}
    </div>
  );
}

export default SharedHierarchyChart;
