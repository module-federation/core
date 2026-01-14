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
} from './share-utils';
import FocusResultDisplay from './FocusResultDisplay';
import styles from './index.module.scss';

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
        <div className={styles.cellCol}>
          <div className={styles.packageName}>{item.packageName}</div>
          <div className={styles.version}>v{item.version}</div>
        </div>
      ),
    },
    {
      title: 'Provider / Scope',
      width: '20%',
      render: (_, item) => (
        <div className={styles.cellColGap}>
          <span className={styles.truncate} title={item.from}>
            Provider: {item.from}
          </span>
          <span className={styles.scopeText}>scope: {item.scope}</span>
        </div>
      ),
    },
    {
      title: 'Status',
      width: '22%',
      render: (_, item) => (
        <div className={styles.cellColGap}>
          {['loaded', 'loading'].includes(item.loadedStatus) ? (
            <Tag
              size="small"
              className={`${styles.tagContainer} loaded-status-tag`}
            >
              {loadedStatusLabel(item.loadedStatus)}
            </Tag>
          ) : null}

          {/* {item.reuseStatus ? (
            <Tag
              size="small"
              color={reuseBadgeColor(item.reuseStatus)}
              className={`${styles.tagContainer} reused-status-tag`}
            >
              Shared
            </Tag>
          ) : null} */}

          <div className={styles.configTags}>
            {item.shareConfig.singleton && (
              <Tag size="small" className={styles.scale90}>
                singleton
              </Tag>
            )}
            {item.shareConfig.eager && (
              <Tag size="small" className={styles.scale90}>
                eager
              </Tag>
            )}
            {item.shareConfig.strictVersion && (
              <Tag size="small" className={styles.scale90}>
                strictVersion
              </Tag>
            )}
            {item.shareConfig.requiredVersion && (
              <Tag size="small" className={styles.scale90}>
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
            <div className={styles.popoverContent}>
              <div className={styles.popoverTitle}>Consumer List</div>
              {item.useIn.length === 0 ? (
                <p className={styles.scopeText}>
                  No applications are consuming this shared dependency version.
                </p>
              ) : (
                <ul className={styles.consumerList}>
                  {item.useIn.map((c) => (
                    <li key={c} className={styles.consumerItem}>
                      <span className={styles.dot} />
                      <span className={styles.packageName}>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          }
        >
          <Button size="mini" type="secondary">
            <div className={styles.btnContent}>
              <Network className={styles.mr1} size={12} />
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
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <p className={styles.heroSubtitle}>
          Module Federation · Shared Dependencies
        </p>
        <h1 className={styles.heroTitle}>
          Overview of Shared Dependencies Usage
        </h1>
      </section>

      <section>
        <div className={styles.statsGrid}>
          <Card className={styles.cardWithPadding}>
            <div className={styles.cardHeader}>
              <div className={styles.statSpace}>
                <div className={styles.statLabel}>Number of Providers</div>
                <div className={styles.statValue}>
                  <Server className={styles.icon} />
                  <span>{stats.totalProviders}</span>
                </div>
              </div>
            </div>
            <p className={styles.statDescription}>
              Number of applications/build versions exposing shared
              dependencies.
            </p>
          </Card>

          <Card className={styles.cardWithPadding}>
            <div className={styles.cardHeader}>
              <div className={styles.statSpace}>
                <div className={styles.statLabel}>Share Scope / Package</div>
                <div className={styles.statValue}>
                  <Layers className={styles.icon} />
                  <span>{stats.totalScopes}</span>
                  <span className={styles.statSubtext}>scope</span>
                </div>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <span className={`${styles.truncate} ${styles.mr2}`}>
                Shared spaces under Scope dimension.
              </span>
              <span className={styles.badgeGroup}>
                <Box className={styles.iconSmall} />
                <span>{stats.totalPackages} packages</span>
              </span>
            </div>
          </Card>

          <Card className={styles.cardWithPadding}>
            <div className={styles.cardHeader}>
              <div className={styles.statSpace}>
                <div className={styles.statLabel}>Version Loading & Reuse</div>
                <div className={styles.statValue}>
                  <Package2 className={styles.icon} />
                  <span>{stats.totalVersions}</span>
                </div>
              </div>
            </div>
            <div className={styles.statusTags}>
              <div className={styles.tagRow}>
                <Tag className={`${styles.tagContent} loaded-status-tag`}>
                  <div className={styles.tagContent}>
                    <Network className={`${styles.iconSmall} ${styles.mr1}`} />
                    <span>Loaded</span>
                    <span className={styles.tagValue}>{stats.loadedCount}</span>
                  </div>
                </Tag>
                <Tag className={`${styles.tagContent} reused-status-tag`}>
                  <div className={styles.tagContent}>
                    <Repeat className={`${styles.iconSmall} ${styles.mr1}`} />
                    <span>Reused</span>
                    <span className={styles.tagValue}>{stats.reusedCount}</span>
                  </div>
                </Tag>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className={styles.rightPanels}>
        {/* Right Two Focus Panels */}
        <div className={styles.panelStack}>
          <Card
            className={styles.card}
            title={
              <div className={styles.cardTitle}>
                <Box className={styles.iconMedium} />
                Who provides the current shared: &apos;{focusPackage}&apos;?
              </div>
            }
          >
            <div className={styles.controlsGrid}>
              <div className={styles.inputGroup}>
                <div className={styles.inputLabel}>Package Name</div>
                <Select
                  showSearch
                  value={focusPackage}
                  onChange={(value) => {
                    setFocusPackage(value);
                    setFocusVersion('');
                  }}
                  placeholder="Select Shared Dependency Package Name"
                  className={styles.fullWidth}
                >
                  {filterOptions.packages.map((name) => (
                    <Select.Option key={name} value={name}>
                      {name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputLabel}>
                  Version (Optional, inferred if empty)
                </div>
                <Select
                  showSearch
                  value={focusVersion || ALL_VALUE}
                  onChange={(value) =>
                    setFocusVersion(value === ALL_VALUE ? '' : value)
                  }
                  placeholder="All Versions"
                  className={styles.fullWidth}
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

            <div className={styles.resultBox}>
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
          className={styles.card}
          title={
            <div className={styles.cardTitle}>
              <Search className={styles.iconMedium} />
              Filter / Search
            </div>
          }
        >
          <div className={styles.filterGrid}>
            <div className={`${styles.inputGroup} ${styles.padding2}`}>
              <div className={styles.inputLabel}>Provider</div>
              <Select
                value={selectedProvider || undefined}
                onChange={(value) =>
                  setSelectedProvider(value === ALL_VALUE ? '' : value)
                }
                placeholder="All Providers"
                className={styles.fullWidth}
                allowClear
              >
                {filterOptions.providers.map((p) => (
                  <Select.Option key={p} value={p}>
                    {p}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className={`${styles.inputGroup} ${styles.padding2}`}>
              <div className={styles.inputLabel}>Package Name</div>
              <Select
                value={selectedPackage || undefined}
                onChange={(value) =>
                  setSelectedPackage(value === ALL_VALUE ? '' : value)
                }
                placeholder="All Packages"
                className={styles.fullWidth}
                allowClear
              >
                {filterOptions.packages.map((name) => (
                  <Select.Option key={name} value={name}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className={`${styles.inputGroup} ${styles.padding2}`}>
              <div className={styles.inputLabel}>Version</div>
              <Select
                value={selectedVersion || undefined}
                onChange={(value) =>
                  setSelectedVersion(value === ALL_VALUE ? '' : value)
                }
                placeholder="All Versions"
                className={styles.fullWidth}
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

          <div className={styles.searchGrid}>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>
                Package Name Keyword (Fuzzy Match)
              </div>
              <Input
                prefix={<Search className={styles.iconMedium} />}
                className={styles.searchInput}
                placeholder="e.g., react / axios"
                value={searchText}
                onChange={(val) => setSearchText(val)}
              />
            </div>

            <div className={styles.matchCount}>
              <span>
                Currently Matched Versions:
                <span className={styles.matchValue}>
                  {filteredVersions.length}
                </span>
              </span>
            </div>
          </div>

          {!hasData && loadingState === 'loading' && (
            <div className={styles.loadingText}>
              Parsing shared dependency data...
            </div>
          )}

          {loadingState === 'error' && (
            <div className={styles.errorText}>
              Failed to load shared dependency data:{' '}
              {errorMessage ?? 'Unknown Error'}
            </div>
          )}

          {hasData && Object.keys(tree).length === 0 && (
            <div className={styles.noMatchText}>
              No matching shared dependency versions under current filter
              conditions, try relaxing the filter conditions.
            </div>
          )}

          {hasData && Object.keys(tree).length > 0 && (
            <div className={styles.treeContainer}>
              <div className={styles.collapseWrapper}>
                <Collapse>
                  {Object.entries(tree).map(([provider, scopes]) => (
                    <Collapse.Item
                      key={provider}
                      name={provider}
                      header={
                        <div className={styles.providerHeader}>
                          <div className={styles.providerTitle}>
                            <Server className={styles.iconMedium} />
                            <span>{provider}</span>
                          </div>
                          <div className={styles.providerMeta}>
                            <span>
                              Scope Count: {Object.keys(scopes).length}
                            </span>
                          </div>
                        </div>
                      }
                    >
                      <div className={styles.scopeList}>
                        {Object.entries(scopes).map(([scopeName, packages]) => {
                          // Flatten data for Table
                          const list = Object.values(packages).flat();
                          return (
                            <div key={scopeName} className={styles.scopeItem}>
                              <div className={styles.scopeHeader}>
                                <Layers className={styles.iconSmall} />
                                <span>Scope: {scopeName}</span>
                              </div>
                              <div className={styles.tableContainer}>
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
