/* eslint-disable max-lines */
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Layers,
  Network,
  Package2,
  Repeat,
  Search,
  Server,
} from 'lucide-react';
import {
  Card,
  Tag,
  Table,
  Input,
  Select,
  Tabs,
  Collapse,
  Popover,
  Button,
} from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';

import type { GlobalShareScopeMap } from '@module-federation/runtime/types';

import {
  normalizeShareData,
  computeShareStats,
  getFilterOptions,
  groupByProviderScopePackage,
  findPackageProvider,
  getReusedVersions,
  LoadedStatus,
  NormalizedSharedVersion,
  ReuseStatus,
} from './share-utils';
import FocusResultDisplay from './FocusResultDisplay';
import styles from './index.module.scss';

const ALL_VALUE = '__all__';

interface SharedDepsExplorerProps {
  shareData?: GlobalShareScopeMap;
}

function loadedStatusLabel(status: LoadedStatus) {
  if (status === 'loaded') {
    return '已加载';
  }
  if (status === 'loading') {
    return '加载中';
  }
  return '未加载';
}

const loadedStatusColor = (status: LoadedStatus) => {
  if (status === 'loaded') {
    return 'green';
  }
  if (status === 'loading') {
    return 'blue';
  }
  return 'gray';
};

function reuseBadgeColor(reuseStatus: ReuseStatus) {
  return reuseStatus ? 'green' : 'gray';
}

function SharedDepsExplorer({
  shareData: shareDataProp,
}: SharedDepsExplorerProps) {
  const [normalized, setNormalized] = useState<NormalizedSharedVersion[]>([]);
  const [loadingState, setLoadingState] = useState<
    'idle' | 'loading' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [searchText, setSearchText] = useState('');

  const [chartScope, setChartScope] = useState('default');

  const [focusPackage, setFocusPackage] = useState('react');
  const [focusVersion, setFocusVersion] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      // 1) 明确传入了 shareData prop，优先使用
      if (shareDataProp && Object.keys(shareDataProp).length > 0) {
        const versions = normalizeShareData(shareDataProp);
        if (!cancelled) {
          setNormalized(versions);
          setLoadingState('idle');
          setErrorMessage(null);
        }
        return;
      }

      // 如果没有 prop，也没有其他来源，可以根据需求处理，这里暂时设置为 idle 但无数据，或者 error
      if (!cancelled) {
        setLoadingState('idle');
        setErrorMessage(null);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [shareDataProp]);

  const stats = useMemo(() => computeShareStats(normalized), [normalized]);
  const filterOptions = useMemo(
    () => getFilterOptions(normalized),
    [normalized],
  );

  useEffect(() => {
    const { scopes } = filterOptions;
    if (!scopes.length) {
      return;
    }

    if (!scopes.includes(chartScope)) {
      if (scopes.includes('default')) {
        setChartScope('default');
      } else {
        setChartScope(scopes[0]);
      }
    }
  }, [filterOptions.scopes, chartScope]);

  const filteredVersions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return normalized.filter((v) => {
      if (selectedProvider && v.provider !== selectedProvider) {
        return false;
      }
      if (selectedPackage && v.packageName !== selectedPackage) {
        return false;
      }
      if (selectedVersion && v.version !== selectedVersion) {
        return false;
      }
      if (keyword && !v.packageName.toLowerCase().includes(keyword)) {
        return false;
      }
      return true;
    });
  }, [
    normalized,
    selectedProvider,
    selectedPackage,
    selectedVersion,
    searchText,
  ]);

  const tree = useMemo(
    () => groupByProviderScopePackage(filteredVersions),
    [filteredVersions],
  );

  const reusedVersions = useMemo(
    () => getReusedVersions(normalized),
    [normalized],
  );

  const reusedByPackage = useMemo(() => {
    const map = new Map<string, NormalizedSharedVersion[]>();

    reusedVersions.forEach((v) => {
      const existing = map.get(v.packageName) ?? [];
      existing.push(v);
      map.set(v.packageName, existing);
    });

    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [reusedVersions]);

  const focusVersionsForPackage = useMemo(() => {
    if (!focusPackage) {
      return [] as string[];
    }

    const set = new Set<string>();
    normalized.forEach((v) => {
      if (v.packageName === focusPackage) {
        set.add(v.version);
      }
    });

    return Array.from(set).sort();
  }, [normalized, focusPackage]);

  const focusResult = useMemo(() => {
    if (!focusPackage) {
      return null;
    }

    return findPackageProvider(
      normalized,
      focusPackage,
      focusVersion || undefined,
    );
  }, [normalized, focusPackage, focusVersion]);

  const hasData = normalized.length > 0;

  const columns: ColumnProps<NormalizedSharedVersion>[] = [
    {
      title: 'Package / Version',
      width: '28%',
      render: (_, item) => (
        <div className="flex flex-col">
          <div className="break-all font-mono text-[11px] text-zinc-800">
            {item.packageName}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">v{item.version}</div>
        </div>
      ),
    },
    {
      title: 'Provider / Scope',
      width: '20%',
      render: (_, item) => (
        <div className="flex flex-col gap-1">
          <span className="truncate" title={item.from}>
            提供方：{item.from}
          </span>
          <span className="text-[11px] text-zinc-500">scope：{item.scope}</span>
        </div>
      ),
    },
    {
      title: '状态',
      width: '22%',
      render: (_, item) => (
        <div className="flex flex-col gap-1">
          <Tag size="small" className="w-16 flex items-center justify-center">
            {loadedStatusLabel(item.loadedStatus)}
          </Tag>
          <Tag
            size="small"
            color={reuseBadgeColor(item.reuseStatus)}
            className="w-16 flex items-center justify-center"
          >
            {item.reuseStatus ? '已共享' : '未共享'}
          </Tag>
          <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-zinc-500">
            {item.shareConfig.singleton && (
              <Tag size="small" className="scale-90 origin-left">
                singleton
              </Tag>
            )}
            {item.shareConfig.eager && (
              <Tag size="small" className="scale-90 origin-left">
                eager
              </Tag>
            )}
            {item.shareConfig.strictVersion && (
              <Tag size="small" className="scale-90 origin-left">
                strictVersion
              </Tag>
            )}
            {item.shareConfig.requiredVersion && (
              <Tag size="small" className="scale-90 origin-left">
                req: {item.shareConfig.requiredVersion}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Consumers',
      width: '18%',
      render: (_, item) => (
        <Popover
          trigger="click"
          position="right"
          content={
            <div className="w-72">
              <div className="mb-1 text-xs font-medium">消费方列表</div>
              {item.useIn.length === 0 ? (
                <p className="text-[11px] text-zinc-500">
                  暂无应用消费该共享依赖版本。
                </p>
              ) : (
                <ul className="space-y-1 text-[11px] text-zinc-700">
                  {item.useIn.map((c) => (
                    <li key={c} className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="break-all">{c}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          }
        >
          <Button size="mini" type="secondary">
            <div className="flex items-center">
              <Network className="h-3 w-3 mr-1" />
              <span>{item.useIn.length || 0} 个应用</span>
            </div>
          </Button>
        </Popover>
      ),
    },
    {
      title: '策略',
      width: '12%',
      render: (_, item) => (
        <Tag size="small" color="gray">
          {item.strategy ?? '-'}
        </Tag>
      ),
    },
  ];

  return (
    <div
      className={`flex flex-col gap-4 px-3 py-4 md:px-4 md:py-6 max-w-5xl mx-auto ${styles.overrideArco}`}
    >
      {/* Hero 区域 */}
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Module Federation · Shared Dependencies
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          共享依赖使用情况总览
        </h1>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-xl shadow-sm border-zinc-200 p-4">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <div className="text-sm text-zinc-500">Provider 数量</div>
                <div className="text-2xl font-semibold flex items-center gap-2">
                  <Server className="h-5 w-5 text-zinc-400" />
                  <span>{stats.totalProviders}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              暴露共享依赖的应用 / 构建版本数量。
            </p>
          </Card>

          <Card className="rounded-xl shadow-sm border-zinc-200 p-4">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <div className="text-sm text-zinc-500">
                  Share Scope / Package
                </div>
                <div className="text-2xl font-semibold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-zinc-400" />
                  <span>{stats.totalScopes}</span>
                  <span className="text-base text-zinc-400">scope</span>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between text-xs text-zinc-500">
              <span>Scope 维度下的共享空间。</span>
              <span className="inline-flex items-center gap-1">
                <Box className="h-3 w-3" />
                <span>{stats.totalPackages} packages</span>
              </span>
            </div>
          </Card>

          <Card className="rounded-xl shadow-sm border-zinc-200 p-4">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <div className="text-sm text-zinc-500">版本加载 &amp; 复用</div>
                <div className="text-2xl font-semibold flex items-center gap-2">
                  <Package2 className="h-5 w-5 text-zinc-400" />
                  <span>{stats.totalVersions}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <Tag className="flex items-center gap-1">
                  <div className="flex items-center">
                    <Network className="h-3 w-3 mr-1" />
                    <span>已加载</span>
                    <span className="font-semibold text-zinc-900 ml-1">
                      {stats.loadedCount}
                    </span>
                  </div>
                </Tag>
                <Tag className="flex items-center gap-1">
                  <div className="flex items-center">
                    <Repeat className="h-3 w-3 mr-1" />
                    <span>复用成功</span>
                    <span className="font-semibold text-zinc-900 ml-1">
                      {stats.reusedCount}
                    </span>
                  </div>
                </Tag>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 筛选与搜索 */}
      <section>
        <Card
          className="rounded-xl shadow-sm border-zinc-200"
          title={
            <div className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-zinc-500" />
              筛选 / 搜索
            </div>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-3">
            <div className="space-y-1 p-2">
              <div className="text-xs text-zinc-500">Provider</div>
              <Select
                value={selectedProvider || ALL_VALUE}
                onChange={(value) =>
                  setSelectedProvider(value === ALL_VALUE ? '' : value)
                }
                placeholder="全部 Provider"
                className="w-full"
              >
                <Select.Option value={ALL_VALUE}>全部 Provider</Select.Option>
                {filterOptions.providers.map((p) => (
                  <Select.Option key={p} value={p}>
                    {p}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="space-y-1 p-2">
              <div className="text-xs text-zinc-500">Package 名称</div>
              <Select
                value={selectedPackage || ALL_VALUE}
                onChange={(value) =>
                  setSelectedPackage(value === ALL_VALUE ? '' : value)
                }
                placeholder="全部 Package"
                className="w-full"
              >
                <Select.Option value={ALL_VALUE}>全部 Package</Select.Option>
                {filterOptions.packages.map((name) => (
                  <Select.Option key={name} value={name}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="space-y-1 p-2">
              <div className="text-xs text-zinc-500">版本</div>
              <Select
                value={selectedVersion || ALL_VALUE}
                onChange={(value) =>
                  setSelectedVersion(value === ALL_VALUE ? '' : value)
                }
                placeholder="全部版本"
                className="w-full"
              >
                <Select.Option value={ALL_VALUE}>全部版本</Select.Option>
                {filterOptions.versions.map((v) => (
                  <Select.Option key={v} value={v}>
                    {v}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 p-2">
            <div className="space-y-1">
              <div className="text-xs text-zinc-500">
                包名关键字（模糊匹配）
              </div>
              <Input
                prefix={<Search className="text-zinc-400 h-3.5 w-3.5" />}
                className="text-xs"
                placeholder="例如：react / axios"
                value={searchText}
                onChange={(val) => setSearchText(val)}
              />
            </div>

            <div className="flex items-end justify-end gap-2 text-xs text-zinc-500">
              <span>
                当前命中版本：
                <span className="font-semibold text-zinc-900 ml-1">
                  {filteredVersions.length}
                </span>
              </span>
            </div>
          </div>

          {!hasData && loadingState === 'loading' && (
            <div className="py-4 text-xs text-zinc-500">
              正在解析共享依赖数据...
            </div>
          )}

          {loadingState === 'error' && (
            <div className="py-3 text-xs text-red-600">
              加载共享依赖数据失败：{errorMessage ?? '未知错误'}
            </div>
          )}

          {hasData && Object.keys(tree).length === 0 && (
            <div className="py-3 text-xs text-zinc-500">
              当前筛选条件下没有匹配的共享依赖版本，尝试放宽筛选条件。
            </div>
          )}

          {hasData && Object.keys(tree).length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              <div className="space-y-2" style={{ border: 0 }}>
                <Collapse>
                  {Object.entries(tree).map(([provider, scopes]) => (
                    <Collapse.Item
                      key={provider}
                      name={provider}
                      header={
                        <div className="flex flex-col items-start gap-1 text-left">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Server className="h-3.5 w-3.5 text-zinc-500" />
                            <span>{provider}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
                            <span>scope 数：{Object.keys(scopes).length}</span>
                          </div>
                        </div>
                      }
                    >
                      <div className="space-y-4">
                        {Object.entries(scopes).map(([scopeName, packages]) => {
                          // Flatten data for Table
                          const list = Object.values(packages).flat();
                          return (
                            <div key={scopeName} className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                                <Layers className="h-3 w-3 text-zinc-500" />
                                <span>Scope：{scopeName}</span>
                              </div>
                              <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-50/40">
                                <Table
                                  columns={columns}
                                  data={list}
                                  pagination={false}
                                  rowKey="id"
                                  border={false}
                                  size="small"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Collapse.Item>
                  ))}
                </Collapse>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* 主体：左侧树 / 表格，右侧两个聚焦面板 */}
      <section className="flex flex-col gap-4">
        {/* 右侧两个问题聚焦面板 */}
        <div className="space-y-4">
          {/* 1. 我怎么看我的共享依赖复用了？ */}
          <Card
            className="rounded-xl shadow-sm border-zinc-200"
            title={
              <div className="text-base flex items-center gap-2">
                <Repeat className="h-4 w-4 text-zinc-500" />
                我怎么看我的共享依赖复用了？
              </div>
            }
            extra={
              <Popover
                content={
                  <div className="w-80 p-2 text-xs space-y-2">
                    <p>
                      复用判定规则：
                      <span className="ml-1 font-medium text-zinc-800">
                        同一个 Provider + Package + Version，当
                        <code className="mx-1 rounded bg-zinc-100 px-1 py-0.5 text-[11px]">
                          useIn
                        </code>
                        中存在至少一个与
                        <code className="mx-1 rounded bg-zinc-100 px-1 py-0.5 text-[11px]">
                          from
                        </code>
                        不同的应用时，视为「复用成功」。
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      换句话说：如果有其他应用在用「别人提供」的那一份共享依赖，就代表复用生效了。
                    </p>
                  </div>
                }
              >
                <Button type="text" size="mini">
                  查看判定规则
                </Button>
              </Popover>
            }
          >
            {reusedVersions.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2">
                当前数据中还没有任何「复用成功」的共享依赖版本。
              </p>
            ) : (
              <Tabs defaultActiveTab="by-package" className="mt-1">
                <Tabs.TabPane key="by-package" title="按包名查看">
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {reusedByPackage.map(([pkgName, list]) => (
                      <div
                        key={pkgName}
                        className="rounded border border-emerald-100 bg-emerald-50/60 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-emerald-900">
                            <Package2 className="h-3.5 w-3.5" />
                            <span className="font-mono text-[11px]">
                              {pkgName}
                            </span>
                          </div>
                          <Tag color="green" size="small">
                            {list.length} 个复用版本
                          </Tag>
                        </div>
                        <div className="mt-2 space-y-1">
                          {list.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-wrap items-center gap-1 text-[11px] text-emerald-900"
                            >
                              <span className="rounded bg-emerald-100/80 px-1.5 py-0.5 font-medium">
                                v{item.version}
                              </span>
                              <span className="text-emerald-900/80">
                                提供方：{item.from}
                              </span>
                              <span className="text-emerald-900/80">
                                Consumers：{item.useIn.join(', ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane key="by-version" title="按版本展开">
                  <div className="max-h-64 overflow-y-auto pr-1 space-y-2 text-xs">
                    {reusedVersions.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center gap-2 rounded border border-emerald-100 bg-emerald-50/60 px-3 py-2"
                      >
                        <span className="font-mono text-[11px]">
                          {item.packageName}@{item.version}
                        </span>
                        <span className="text-emerald-900/80">
                          提供方：{item.from}
                        </span>
                        <span className="text-emerald-900/80">
                          Consumers：{item.useIn.join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </Tabs.TabPane>
              </Tabs>
            )}
          </Card>

          {/* 2. 当前的 react 是谁提供的？ */}
          <Card
            className="rounded-xl shadow-sm border-zinc-200"
            title={
              <div className="text-base flex items-center gap-2">
                <Box className="h-4 w-4 text-zinc-500" />
                当前的 react 是谁提供的？
              </div>
            }
            extra={
              <div
                className="text-xs text-zinc-500 max-w-xs truncate"
                title="选择包名（默认 react）以及可选的版本，快速查看当前环境下「谁在提供这个共享依赖」，以及它是否已经被加载。"
              >
                选择包名...
              </div>
            }
          >
            <div className="grid gap-3 md:grid-cols-2 mb-3">
              <div className="space-y-1">
                <div className="text-xs text-zinc-500">包名</div>
                <Select
                  value={focusPackage}
                  onChange={(value) => {
                    setFocusPackage(value);
                    setFocusVersion('');
                  }}
                  placeholder="选择共享依赖包名"
                  className="w-full"
                >
                  {filterOptions.packages.map((name) => (
                    <Select.Option key={name} value={name}>
                      {name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-zinc-500">
                  版本（可选，不填则自动推断）
                </div>
                <Select
                  value={focusVersion || ALL_VALUE}
                  onChange={(value) =>
                    setFocusVersion(value === ALL_VALUE ? '' : value)
                  }
                  placeholder="全部版本"
                  className="w-full"
                >
                  <Select.Option value={ALL_VALUE}>全部版本</Select.Option>
                  {focusVersionsForPackage.map((v) => (
                    <Select.Option key={v} value={v}>
                      {v}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="rounded-md border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-xs">
              <FocusResultDisplay
                focusResult={focusResult}
                hasData={hasData}
                loadedStatusColor={loadedStatusColor}
                loadedStatusLabel={loadedStatusLabel}
              />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default SharedDepsExplorer;
