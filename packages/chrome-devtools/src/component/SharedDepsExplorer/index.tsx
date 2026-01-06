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
  LoadedStatus,
  NormalizedSharedVersion,
  ReuseStatus,
} from './share-utils';
import FocusResultDisplay from './FocusResultDisplay';

const ALL_VALUE = '__all__';

interface SharedDepsExplorerProps {
  shareData?: GlobalShareScopeMap;
}

function loadedStatusLabel(status: LoadedStatus) {
  if (status === 'loaded') {
    return 'Loaded';
  }
  if (status === 'loading') {
    return 'Loading';
  }
  return 'Not Loaded';
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
      // 1) Explicitly passed shareData prop, use it preferentially
      if (shareDataProp && Object.keys(shareDataProp).length > 0) {
        const versions = normalizeShareData(shareDataProp);
        if (!cancelled) {
          setNormalized(versions);
          setLoadingState('idle');
          setErrorMessage(null);
        }
        return;
      }

      // If no prop and no other source, handle as needed, currently set to idle but no data, or error
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
      if (selectedProvider && v.from !== selectedProvider) {
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

  // const reusedVersions = useMemo(
  //   () => getReusedVersions(normalized),
  //   [normalized],
  // );

  // const reusedByPackage = useMemo(() => {
  //   const map = new Map<string, NormalizedSharedVersion[]>();

  //   reusedVersions.forEach((v) => {
  //     const existing = map.get(v.packageName) ?? [];
  //     existing.push(v);
  //     map.set(v.packageName, existing);
  //   });

  //   return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  // }, [reusedVersions]);

  const versionsForSelectedPackage = useMemo(() => {
    if (!selectedPackage) {
      return [];
    }
    const set = new Set<string>();
    normalized.forEach((v) => {
      if (v.packageName === selectedPackage) {
        set.add(v.version);
      }
    });
    return Array.from(set).sort();
  }, [normalized, selectedPackage]);

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
            Provider: {item.from}
          </span>
          <span className="text-[11px] text-zinc-500">scope: {item.scope}</span>
        </div>
      ),
    },
    {
      title: 'Status',
      width: '22%',
      render: (_, item) => (
        <div className="flex flex-col gap-1">
          {['loaded', 'loading'].includes(item.loadedStatus) ? (
            <Tag
              size="small"
              className={`w-16 flex items-center justify-center loaded-status-tag`}
            >
              {loadedStatusLabel(item.loadedStatus)}
            </Tag>
          ) : null}

          {/* {item.reuseStatus ? (
            <Tag
              size="small"
              color={reuseBadgeColor(item.reuseStatus)}
              className={`w-16 flex items-center justify-center reused-status-tag`}
            >
              Shared
            </Tag>
          ) : null} */}

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
              <div className="mb-1 text-xs font-medium">Consumer List</div>
              {item.useIn.length === 0 ? (
                <p className="text-[11px] text-zinc-500">
                  No applications are consuming this shared dependency version.
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
              <span>{item.useIn.length || 0} Apps</span>
            </div>
          </Button>
        </Popover>
      ),
    },
    {
      title: 'Strategy',
      width: '12%',
      render: (_, item) => (
        <Tag size="small" color="gray">
          {item.strategy ?? '-'}
        </Tag>
      ),
    },
  ];

  return (
    <div className={`flex flex-col gap-4 px-3 py-4 md:px-4 md:py-6 max-w-5xl`}>
      {/* Hero Section */}
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Module Federation · Shared Dependencies
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Overview of Shared Dependencies Usage
        </h1>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-xl shadow-sm border-zinc-200 p-4">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <div className="text-sm text-zinc-500">Number of Providers</div>
                <div className="text-2xl font-semibold flex items-center gap-2">
                  <Server className="h-5 w-5 text-zinc-400" />
                  <span>{stats.totalProviders}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Number of applications/build versions exposing shared
              dependencies.
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
            <div className="flex items-center justify-between text-xs text-zinc-500 whitespace-nowrap">
              <span className="truncate mr-2">
                Shared spaces under Scope dimension.
              </span>
              <span className="inline-flex items-center gap-1 flex-shrink-0">
                <Box className="h-3 w-3" />
                <span>{stats.totalPackages} packages</span>
              </span>
            </div>
          </Card>

          <Card className="rounded-xl shadow-sm border-zinc-200 p-4">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <div className="text-sm text-zinc-500">
                  Version Loading & Reuse
                </div>
                <div className="text-2xl font-semibold flex items-center gap-2">
                  <Package2 className="h-5 w-5 text-zinc-400" />
                  <span>{stats.totalVersions}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <Tag className="flex items-center gap-1 loaded-status-tag">
                  <div className="flex items-center">
                    <Network className="h-3 w-3 mr-1" />
                    <span>Loaded</span>
                    <span className="font-semibold text-zinc-900 ml-1">
                      {stats.loadedCount}
                    </span>
                  </div>
                </Tag>
                <Tag className="flex items-center gap-1 reused-status-tag">
                  <div className="flex items-center">
                    <Repeat className="h-3 w-3 mr-1" />
                    <span>Reused</span>
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

      <section className="flex flex-col gap-4">
        {/* Right Two Focus Panels */}
        <div className="space-y-4">
          <Card
            className="rounded-xl shadow-sm border-zinc-200"
            title={
              <div className="text-base flex items-center gap-2">
                <Box className="h-4 w-4 text-zinc-500" />
                Who provides the current shared: '{focusPackage}'?
              </div>
            }
          >
            <div className="grid gap-3 md:grid-cols-2 mb-3 p-2">
              <div className="space-y-1">
                <div className="text-xs text-zinc-500">Package Name</div>
                <Select
                  showSearch
                  value={focusPackage}
                  onChange={(value) => {
                    setFocusPackage(value);
                    setFocusVersion('');
                  }}
                  placeholder="Select Shared Dependency Package Name"
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
                  Version (Optional, inferred if empty)
                </div>
                <Select
                  showSearch
                  value={focusVersion || ALL_VALUE}
                  onChange={(value) =>
                    setFocusVersion(value === ALL_VALUE ? '' : value)
                  }
                  placeholder="All Versions"
                  className="w-full"
                >
                  <Select.Option value={ALL_VALUE}>All Versions</Select.Option>
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
                loadedStatusLabel={loadedStatusLabel}
              />
            </div>
          </Card>
        </div>
      </section>
      {/* Filter & Search */}
      <section>
        <Card
          className="rounded-xl shadow-sm border-zinc-200"
          title={
            <div className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-zinc-500" />
              Filter / Search
            </div>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-3">
            <div className="space-y-1 p-2">
              <div className="text-xs text-zinc-500">Provider</div>
              <Select
                value={selectedProvider || undefined}
                onChange={(value) =>
                  setSelectedProvider(value === ALL_VALUE ? '' : value)
                }
                placeholder="All Providers"
                className="w-full"
                allowClear
              >
                {filterOptions.providers.map((p) => (
                  <Select.Option key={p} value={p}>
                    {p}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="space-y-1 p-2">
              <div className="text-xs text-zinc-500">Package Name</div>
              <Select
                value={selectedPackage || undefined}
                onChange={(value) =>
                  setSelectedPackage(value === ALL_VALUE ? '' : value)
                }
                placeholder="All Packages"
                className="w-full"
                allowClear
              >
                {filterOptions.packages.map((name) => (
                  <Select.Option key={name} value={name}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="space-y-1 p-2">
              <div className="text-xs text-zinc-500">Version</div>
              <Select
                value={selectedVersion || undefined}
                onChange={(value) =>
                  setSelectedVersion(value === ALL_VALUE ? '' : value)
                }
                placeholder="All Versions"
                className="w-full"
                disabled={!selectedPackage}
                allowClear
              >
                {versionsForSelectedPackage.map((v) => (
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
                Package Name Keyword (Fuzzy Match)
              </div>
              <Input
                prefix={<Search className="text-zinc-400 h-3.5 w-3.5" />}
                className="text-xs"
                placeholder="e.g., react / axios"
                value={searchText}
                onChange={(val) => setSearchText(val)}
              />
            </div>

            <div className="flex items-end justify-end gap-2 text-xs text-zinc-500">
              <span>
                Currently Matched Versions:
                <span className="font-semibold text-zinc-900 ml-1">
                  {filteredVersions.length}
                </span>
              </span>
            </div>
          </div>

          {!hasData && loadingState === 'loading' && (
            <div className="py-4 text-xs text-zinc-500">
              Parsing shared dependency data...
            </div>
          )}

          {loadingState === 'error' && (
            <div className="py-3 text-xs text-red-600">
              Failed to load shared dependency data:{' '}
              {errorMessage ?? 'Unknown Error'}
            </div>
          )}

          {hasData && Object.keys(tree).length === 0 && (
            <div className="py-3 text-xs text-zinc-500">
              No matching shared dependency versions under current filter
              conditions, try relaxing the filter conditions.
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
                            <span>
                              Scope Count: {Object.keys(scopes).length}
                            </span>
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
                                <span>Scope: {scopeName}</span>
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
    </div>
  );
}

export default SharedDepsExplorer;
