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
  Info,
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
  Tooltip,
} from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { useTranslation } from 'react-i18next';

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

type HoverTagProps = Omit<React.ComponentProps<typeof Tag>, 'children'> & {
  tooltip?: React.ComponentProps<typeof Popover>['content'];
  children: React.ComponentProps<typeof Tag>['children'];
};

function HoverTag({ tooltip, children, ...tagProps }: HoverTagProps) {
  return (
    <Popover trigger="hover" position="top" content={tooltip ?? children}>
      <Tag {...tagProps}>{children}</Tag>
    </Popover>
  );
}

function SharedDepsExplorer({
  shareData: shareDataProp,
}: SharedDepsExplorerProps) {
  const { t } = useTranslation();

  const [normalized, setNormalized] = useState<NormalizedSharedVersion[]>([]);
  const [loadingState, setLoadingState] = useState<
    'idle' | 'loading' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const loadedStatusLabelLocal = (status: LoadedStatus) => {
    if (status === 'loaded') {
      return t('sharedDeps.status.loaded');
    }
    if (status === 'loading') {
      return t('sharedDeps.status.loading');
    }
    if (status === 't-loaded') {
      return t('sharedDeps.status.tLoaded');
    }
    if (status === 't-loading') {
      return t('sharedDeps.status.tLoading');
    }
    return t('sharedDeps.status.notLoaded');
  };
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
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
      if (selectedMode && v.treeShakingMode !== selectedMode) {
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
    selectedMode,
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

  const modesForSelectedPackage = useMemo(() => {
    if (!selectedPackage) {
      return [];
    }
    const set = new Set<string>();
    normalized.forEach((v) => {
      if (v.packageName === selectedPackage && v.treeShakingMode) {
        set.add(v.treeShakingMode);
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
      title: t('sharedDeps.table.columns.packageVersion'),
      width: '28%',
      render: (_, item) => (
        <div className={styles.cellCol}>
          <div className={styles.packageName}>{item.packageName}</div>
          <div className={styles.version}>v{item.version}</div>
        </div>
      ),
    },
    {
      title: t('sharedDeps.table.columns.providerScope'),
      width: '20%',
      render: (_, item) => (
        <div className={styles.cellColGap}>
          <span className={styles.truncate} title={item.from}>
            {t('sharedDeps.table.providerPrefix', { name: item.from })}
          </span>
          <span className={styles.scopeText}>
            {t('sharedDeps.table.scopePrefix', { scope: item.scope })}
          </span>
        </div>
      ),
    },
    {
      title: t('sharedDeps.table.columns.status'),
      width: '22%',
      render: (_, item) => (
        <div className={styles.cellColGap}>
          {['loaded', 'loading', 't-loaded', 't-loading'].includes(
            item.loadedStatus,
          ) ? (
            <HoverTag
              size="small"
              className={`${styles.tagContainer} loaded-status-tag`}
              tooltip={loadedStatusLabelLocal(item.loadedStatus)}
            >
              {loadedStatusLabelLocal(item.loadedStatus)}
            </HoverTag>
          ) : null}

          {item.treeShakingMode ? (
            <HoverTag
              size="small"
              className={styles.tagContainer}
              tooltip={item.treeShakingMode}
            >
              {item.treeShakingMode}
            </HoverTag>
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
              <HoverTag
                size="small"
                className={styles.scale90}
                tooltip="singleton"
              >
                singleton
              </HoverTag>
            )}
            {item.shareConfig.eager && (
              <HoverTag size="small" className={styles.scale90} tooltip="eager">
                eager
              </HoverTag>
            )}
            {item.shareConfig.strictVersion && (
              <HoverTag
                size="small"
                className={styles.scale90}
                tooltip="strictVersion"
              >
                strictVersion
              </HoverTag>
            )}
            {item.shareConfig.requiredVersion && (
              <HoverTag
                size="small"
                className={styles.scale90}
                tooltip={`requiredVersion: ${item.shareConfig.requiredVersion}`}
              >
                requiredVersion: {item.shareConfig.requiredVersion}
              </HoverTag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t('sharedDeps.table.columns.consumers'),
      width: '18%',
      render: (_, item) => (
        <Popover
          trigger="click"
          position="right"
          content={
            <div className={styles.popoverContent}>
              <div className={styles.popoverTitle}>
                {t('sharedDeps.consumersPopover.title')}
              </div>
              {item.useIn.length === 0 ? (
                <p className={styles.scopeText}>
                  {t('sharedDeps.consumersPopover.empty')}
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
              <span>
                {t('sharedDeps.consumersPopover.button', {
                  count: item.useIn.length || 0,
                })}
              </span>
            </div>
          </Button>
        </Popover>
      ),
    },
    {
      title: t('sharedDeps.table.columns.strategy'),
      width: '12%',
      render: (_, item) => (
        <HoverTag size="small" color="gray">
          {item.strategy ?? t('sharedDeps.table.strategyFallback')}
        </HoverTag>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <p className={styles.heroSubtitle}>{t('sharedDeps.hero.subtitle')}</p>
        <h1 className={styles.heroTitle}>{t('sharedDeps.hero.title')}</h1>
      </section>

      <section>
        <div className={styles.statsGrid}>
          <Card className={styles.cardWithPadding}>
            <div className={styles.cardHeader}>
              <div className={styles.statSpace}>
                <div className={styles.statLabel}>
                  {t('sharedDeps.stats.providers.title')}
                </div>
                <div className={styles.statValue}>
                  <Server className={styles.icon} />
                  <span>{stats.totalProviders}</span>
                </div>
              </div>
            </div>
            <p className={styles.statDescription}>
              {t('sharedDeps.stats.providers.description')}
            </p>
          </Card>

          <Card className={styles.cardWithPadding}>
            <div className={styles.cardHeader}>
              <div className={styles.statSpace}>
                <div className={styles.statLabel}>
                  {t('sharedDeps.stats.scopes.title')}
                </div>
                <div className={styles.statValue}>
                  <Layers className={styles.icon} />
                  <span>{stats.totalScopes}</span>
                  <span className={styles.statSubtext}>
                    {t('sharedDeps.stats.scopes.badge')}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <span className={`${styles.truncate} ${styles.mr2}`}>
                {t('sharedDeps.stats.scopes.description')}
              </span>
              <span className={styles.badgeGroup}>
                <Box className={styles.iconSmall} />
                <span>
                  {stats.totalPackages}
                  {t('sharedDeps.stats.scopes.packagesBadge', {
                    count: stats.totalPackages,
                  })}
                </span>
              </span>
            </div>
          </Card>

          <Card className={styles.cardWithPadding}>
            <div className={styles.cardHeader}>
              <div className={styles.statSpace}>
                <div className={styles.statLabel}>
                  {t('sharedDeps.stats.versions.title')}
                </div>
                <div className={styles.statValue}>
                  <Package2 className={styles.icon} />
                  <span>{stats.totalVersions}</span>
                </div>
              </div>
            </div>
            <div className={styles.statusTags}>
              <div className={styles.tagRow}>
                <HoverTag
                  className={`${styles.tagContent} loaded-status-tag`}
                  tooltip={`Loaded: ${stats.loadedCount}`}
                >
                  <div className={styles.tagContent}>
                    <Network className={`${styles.iconSmall} ${styles.mr1}`} />
                    <span>{t('sharedDeps.stats.versions.loadedLabel')}</span>
                    <span className={styles.tagValue}>{stats.loadedCount}</span>
                  </div>
                </HoverTag>
                <HoverTag
                  className={`${styles.tagContent} reused-status-tag`}
                  tooltip={`Reused: ${stats.reusedCount}`}
                >
                  <div className={styles.tagContent}>
                    <Repeat className={`${styles.iconSmall} ${styles.mr1}`} />
                    <span>
                      <span>{t('sharedDeps.stats.versions.reusedLabel')}</span>
                    </span>
                    <span className={styles.tagValue}>{stats.reusedCount}</span>
                  </div>
                </HoverTag>
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
                {t('sharedDeps.focusPanel.title', { package: focusPackage })}
              </div>
            }
          >
            <div className={styles.controlsGrid}>
              <div className={styles.inputGroup}>
                <div className={styles.inputLabel}>
                  {t('sharedDeps.focusPanel.packageLabel')}
                </div>
                <Select
                  showSearch
                  value={focusPackage}
                  onChange={(value) => {
                    setFocusPackage(value);
                    setFocusVersion('');
                  }}
                  placeholder={t('sharedDeps.focusPanel.packagePlaceholder')}
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
                  {t('sharedDeps.focusPanel.versionLabel')}
                </div>
                <Select
                  showSearch
                  value={focusVersion || ALL_VALUE}
                  onChange={(value) =>
                    setFocusVersion(value === ALL_VALUE ? '' : value)
                  }
                  placeholder={t('sharedDeps.focusPanel.versionPlaceholder')}
                  className={styles.fullWidth}
                >
                  <Select.Option value={ALL_VALUE}>
                    {t('sharedDeps.focusPanel.versionAllOption')}
                  </Select.Option>
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
                loadedStatusLabel={loadedStatusLabelLocal}
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
              {t('sharedDeps.filters.cardTitle')}
            </div>
          }
        >
          <div className={styles.filterGrid}>
            <div className={`${styles.inputGroup} ${styles.padding2}`}>
              <div className={styles.inputLabel}>
                {t('sharedDeps.filters.providerLabel')}
              </div>
              <Select
                value={selectedProvider || undefined}
                onChange={(value) =>
                  setSelectedProvider(value === ALL_VALUE ? '' : value)
                }
                placeholder={t('sharedDeps.filters.providerPlaceholder')}
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
              <div className={styles.inputLabel}>
                {t('sharedDeps.filters.packageLabel')}
              </div>
              <Select
                value={selectedPackage || undefined}
                onChange={(value) =>
                  setSelectedPackage(value === ALL_VALUE ? '' : value)
                }
                placeholder={t('sharedDeps.filters.packagePlaceholder')}
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
              <div className={styles.inputLabel}>
                {t('sharedDeps.filters.versionLabel')}
              </div>
              <Select
                value={selectedVersion || undefined}
                onChange={(value) =>
                  setSelectedVersion(value === ALL_VALUE ? '' : value)
                }
                placeholder={t('sharedDeps.filters.versionPlaceholder')}
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

            <div className={`${styles.inputGroup} ${styles.padding2}`}>
              <div
                className={styles.inputLabel}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Mode
                <Tooltip content="Shared Tree Shaking Mode, options: server-calc | runtime-infer">
                  <Info
                    size={14}
                    style={{ cursor: 'help', color: '#86909c' }}
                  />
                </Tooltip>
              </div>
              <Select
                value={selectedMode || undefined}
                onChange={(value) =>
                  setSelectedMode(value === ALL_VALUE ? '' : value)
                }
                placeholder="All Modes"
                className={styles.fullWidth}
                disabled={
                  !selectedPackage || modesForSelectedPackage.length === 0
                }
                allowClear
              >
                {modesForSelectedPackage.map((v) => (
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
                {t('sharedDeps.filters.keywordLabel')}
              </div>
              <Input
                prefix={<Search className={styles.iconMedium} />}
                className={styles.searchInput}
                placeholder={t('sharedDeps.filters.keywordPlaceholder')}
                value={searchText}
                onChange={(val) => setSearchText(val)}
              />
            </div>

            <div className={styles.matchCount}>
              <span>
                {t('sharedDeps.filters.matchCountLabel')}
                <span className={styles.matchValue}>
                  {filteredVersions.length}
                </span>
              </span>
            </div>
          </div>

          {!hasData && loadingState === 'loading' && (
            <div className={styles.loadingText}>
              {t('sharedDeps.messages.loading')}
            </div>
          )}

          {loadingState === 'error' && (
            <div className={styles.errorText}>
              {errorMessage
                ? t('sharedDeps.messages.error', { message: errorMessage })
                : t('sharedDeps.messages.errorUnknown')}
            </div>
          )}

          {hasData && Object.keys(tree).length === 0 && (
            <div className={styles.noMatchText}>
              {t('sharedDeps.messages.noMatch')}
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
                              {t('sharedDeps.filters.scopeCount', {
                                count: Object.keys(scopes).length,
                              })}
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
                                <span>
                                  {t('sharedDeps.filters.scopePrefix', {
                                    name: scopeName,
                                  })}
                                </span>
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
