/* eslint-disable max-lines */
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Empty, Select, Tooltip, Button } from '@arco-design/web-react';
import { IconMinus, IconPlus } from '@arco-design/web-react/icon';
import { Graph, type EdgeData, type NodeData } from '@antv/g6';

import styles from './index.module.scss';

interface ShareGraphProps {
  shareInfo: Record<string, unknown>;
}

interface ShareEntry {
  id: string;
  instance: string;
  scope: string;
  name: string;
  version: string;
  from?: string;
  usedIn: Array<string>;
  deps: Array<string>;
  eager?: boolean;
  loaded?: boolean;
  strategy?: string;
  lib?: any;
}

interface ShareFilters {
  scope: string;
  name: string;
  version: string;
  from: string;
  usedIn: string;
}

const { Option } = Select;

type ShareNodeRole = 'provider' | 'share' | 'consumer' | 'placeholder';
type RoleStyle = { fill: string; stroke: string; lineDash?: number[] };
type RoleStyleMap = Record<ShareNodeRole, RoleStyle>;

interface ThemeDrivenStyles {
  roles: RoleStyleMap;
  labelColor: string;
  highlight: {
    loaded: string;
    unloaded: string;
  };
}

const DEFAULT_SCOPE = 'default';

const COLUMN_X = {
  provider: 0,
  share: 420,
  consumer: 860,
};
const CONSUMER_GAP = 140;
const SECTION_GAP = 140;
const MIN_WIDTH = 200;
const MAX_WIDTH = 420;
const LABEL_PADDING: [number, number, number, number] = [8, 12, 8, 12];

type G6GraphInstance = InstanceType<typeof Graph>;

const FALLBACK_ROLE_STYLES: RoleStyleMap = {
  provider: {
    fill: 'rgba(56, 189, 248, 0.14)',
    stroke: 'rgba(56, 189, 248, 0.32)',
  },
  share: {
    fill: 'rgba(99, 102, 241, 0.2)',
    stroke: 'rgba(129, 140, 248, 0.55)',
  },
  consumer: {
    fill: 'rgba(244, 114, 181, 0.16)',
    stroke: 'rgba(244, 114, 181, 0.35)',
  },
  placeholder: {
    fill: 'rgba(148, 163, 184, 0.12)',
    stroke: 'rgba(148, 163, 184, 0.55)',
    lineDash: [6, 6],
  },
};

const FALLBACK_LABEL_COLOR = '#e2e8f0';
const FALLBACK_LOADED_STROKE = '#818cf8';
const FALLBACK_UNLOADED_STROKE = 'rgba(148, 163, 184, 0.6)';

const ROLE_KEYS: ShareNodeRole[] = [
  'provider',
  'share',
  'consumer',
  'placeholder',
];

const isLineDashEqual = (a?: number[], b?: number[]) => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
};

const isRoleStyleMapEqual = (a: RoleStyleMap, b: RoleStyleMap) =>
  ROLE_KEYS.every((key) => {
    const styleA = a[key];
    const styleB = b[key];
    return (
      styleA.fill === styleB.fill &&
      styleA.stroke === styleB.stroke &&
      isLineDashEqual(styleA.lineDash, styleB.lineDash)
    );
  });

const isThemeDrivenStylesEqual = (a: ThemeDrivenStyles, b: ThemeDrivenStyles) =>
  a.labelColor === b.labelColor &&
  a.highlight.loaded === b.highlight.loaded &&
  a.highlight.unloaded === b.highlight.unloaded &&
  isRoleStyleMapEqual(a.roles, b.roles);

const cloneRoleStyles = (styles: RoleStyleMap): RoleStyleMap => ({
  provider: {
    ...styles.provider,
    lineDash: styles.provider.lineDash
      ? [...styles.provider.lineDash]
      : undefined,
  },
  share: {
    ...styles.share,
    lineDash: styles.share.lineDash ? [...styles.share.lineDash] : undefined,
  },
  consumer: {
    ...styles.consumer,
    lineDash: styles.consumer.lineDash
      ? [...styles.consumer.lineDash]
      : undefined,
  },
  placeholder: {
    ...styles.placeholder,
    lineDash: styles.placeholder.lineDash
      ? [...styles.placeholder.lineDash]
      : undefined,
  },
});

const wrapLine = (text: string, limit: number) => {
  if (!text) {
    return [''];
  }
  const result: string[] = [];
  let current = '';
  const pushCurrent = () => {
    if (current.trim().length > 0) {
      result.push(current.trim());
    } else if (current.length) {
      result.push(current);
    }
  };
  const words = text.split(' ');
  if (words.length === 1) {
    for (const char of text) {
      if ((current + char).length > limit) {
        pushCurrent();
        current = char;
      } else {
        current += char;
      }
    }
    if (current.length) {
      pushCurrent();
    }
    return result;
  }
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > limit) {
      pushCurrent();
      current = word;
      if (current.length > limit) {
        for (const char of current) {
          if ((result[result.length - 1] ?? '').length >= limit) {
            result.push(char);
          } else {
            result[result.length - 1] =
              `${result[result.length - 1] ?? ''}${char}`;
          }
        }
        current = '';
      }
    } else {
      current = candidate;
    }
  }
  if (current.length) {
    pushCurrent();
  }
  return result;
};

const buildLines = (texts: Array<string>, limit = 26) => {
  const lines: string[] = [];
  texts.forEach((text) => {
    wrapLine(text, limit).forEach((line) => {
      if (line) {
        lines.push(line);
      }
    });
  });
  return lines.length ? lines : [''];
};

const nodeLabel = (
  entry: ShareEntry,
  role: ShareNodeRole,
  consumerName?: string,
) => {
  if (role === 'provider') {
    return buildLines(
      [
        entry.from || '未知提供方',
        `实例: ${entry.instance}`,
        `作用域: ${entry.scope}`,
      ],
      24,
    );
  }

  if (role === 'share') {
    const meta: string[] = [`名称: ${entry.name}`, `版本: ${entry.version}`];
    if (entry.deps.length) {
      meta.push(`依赖: ${entry.deps.join(', ')}`);
    }
    const status: string[] = [];
    if (typeof entry.loaded === 'boolean') {
      status.push(entry.loaded ? '已加载' : '未加载');
    }
    if (typeof entry.eager === 'boolean') {
      status.push(entry.eager ? 'eager' : 'lazy');
    }
    if (entry.strategy) {
      status.push(`策略: ${entry.strategy}`);
    }
    if (status.length) {
      meta.push(`状态: ${status.join(' / ')}`);
    }
    return buildLines(meta, 26);
  }

  if (role === 'consumer') {
    return buildLines([consumerName || '未知使用方'], 28);
  }

  return buildLines(['无使用方'], 28);
};

const computeNodeSize = (lines: string[]) => {
  const longest = Math.max(...lines.map((line) => line.length), 4);
  const contentWidth = longest * 9;
  const width = Math.min(
    MAX_WIDTH,
    Math.max(
      MIN_WIDTH,
      contentWidth + LABEL_PADDING[1] + LABEL_PADDING[3] + 16,
    ),
  );
  const height = Math.max(
    64,
    lines.length * 20 + LABEL_PADDING[0] + LABEL_PADDING[2] + 16,
  );
  return [width, height] as [number, number];
};

const buildGraphElements = (
  entries: ShareEntry[],
  roleStyles: RoleStyleMap,
  labelColor: string,
  highlight: { loaded: string; unloaded: string },
) => {
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];
  let currentY = 0;

  entries.forEach((entry, entryIndex) => {
    const consumerCount = Math.max(entry.usedIn.length, 1);
    const blockHeight = consumerCount * CONSUMER_GAP;
    const centerY = currentY + blockHeight / 2;

    const providerLines = nodeLabel(entry, 'provider');
    const providerId = `provider-${entry.id}-${entryIndex}`;
    const providerSize = computeNodeSize(providerLines);
    nodes.push({
      id: providerId,
      data: {
        role: 'provider',
        entryId: entry.id,
        instance: entry.instance,
        scope: entry.scope,
      },
      style: {
        x: COLUMN_X.provider,
        y: centerY,
        size: providerSize,
        radius: 12,
        lineWidth: 1.5,
        fill: roleStyles.provider.fill,
        stroke: roleStyles.provider.stroke,
        lineDash: roleStyles.provider.lineDash,
        label: true,
        labelText: providerLines.join('\n'),
        labelFill: labelColor,
        labelFontSize: 12,
        labelLineHeight: 18,
        labelTextAlign: 'center',
        labelTextBaseline: 'middle',
        labelPadding: LABEL_PADDING,
      },
    });

    const shareLines = nodeLabel(entry, 'share');
    const shareId = `share-${entry.id}-${entryIndex}`;
    const shareSize = computeNodeSize(shareLines);
    const shareLoaded = entry.loaded === true;
    const shareStroke = shareLoaded ? highlight.loaded : highlight.unloaded;
    let shareLineDash: number[] | undefined;
    if (shareLoaded) {
      shareLineDash = roleStyles.share.lineDash;
    } else {
      shareLineDash = [8, 6];
    }
    nodes.push({
      id: shareId,
      data: {
        role: 'share',
        entryId: entry.id,
        name: entry.name,
        version: entry.version,
      },
      style: {
        x: COLUMN_X.share,
        y: centerY,
        size: shareSize,
        radius: 12,
        lineWidth: shareLoaded ? 3 : 1.5,
        fill: roleStyles.share.fill,
        stroke: shareStroke,
        lineDash: shareLineDash,
        label: true,
        labelText: shareLines.join('\n'),
        labelFill: labelColor,
        labelFontSize: 12,
        labelLineHeight: 18,
        labelTextAlign: 'center',
        labelTextBaseline: 'middle',
        labelPadding: LABEL_PADDING,
        labelFontWeight: shareLoaded ? 600 : 400,
      },
    });

    edges.push({
      id: `edge-${providerId}-${shareId}`,
      source: providerId,
      target: shareId,
      style: {
        radius: 12,
        stroke: highlight.loaded,
        lineWidth: 2.4,
        endArrow: true,
      },
    });

    if (entry.usedIn.length) {
      entry.usedIn.forEach((consumerName, consumerIndex) => {
        const consumerLines = nodeLabel(entry, 'consumer', consumerName);
        const consumerId = `consumer-${entry.id}-${entryIndex}-${consumerIndex}`;
        const consumerY =
          consumerCount === 1
            ? centerY
            : currentY + consumerIndex * CONSUMER_GAP + CONSUMER_GAP / 2;

        const consumerSize = computeNodeSize(consumerLines);
        nodes.push({
          id: consumerId,
          data: {
            role: 'consumer',
            entryId: entry.id,
            consumerName,
          },
          style: {
            x: COLUMN_X.consumer,
            y: consumerY,
            size: consumerSize,
            radius: 12,
            lineWidth: 1.5,
            fill: roleStyles.consumer.fill,
            stroke: roleStyles.consumer.stroke,
            lineDash: roleStyles.consumer.lineDash,
            label: true,
            labelText: consumerLines.join('\n'),
            labelFill: labelColor,
            labelFontSize: 12,
            labelLineHeight: 18,
            labelTextAlign: 'center',
            labelTextBaseline: 'middle',
            labelPadding: LABEL_PADDING,
          },
        });

        edges.push({
          id: `edge-${shareId}-${consumerId}`,
          source: shareId,
          target: consumerId,
          style: {
            radius: 12,
            stroke: highlight.loaded,
            lineWidth: 2,
            endArrow: true,
          },
        });
      });
    } else {
      const placeholderLines = nodeLabel(entry, 'placeholder');
      const placeholderId = `placeholder-${entry.id}-${entryIndex}`;
      const placeholderSize = computeNodeSize(placeholderLines);
      nodes.push({
        id: placeholderId,
        data: {
          role: 'placeholder',
          entryId: entry.id,
        },
        style: {
          x: COLUMN_X.consumer,
          y: centerY,
          size: placeholderSize,
          radius: 12,
          lineWidth: 1.5,
          fill: roleStyles.placeholder.fill,
          stroke: roleStyles.placeholder.stroke,
          lineDash: roleStyles.placeholder.lineDash,
          label: true,
          labelText: placeholderLines.join('\n'),
          labelFill: labelColor,
          labelFontSize: 12,
          labelLineHeight: 18,
          labelTextAlign: 'center',
          labelTextBaseline: 'middle',
          labelPadding: LABEL_PADDING,
        },
      });

      edges.push({
        id: `edge-${shareId}-${placeholderId}`,
        source: shareId,
        target: placeholderId,
        style: {
          radius: 12,
          stroke: highlight.unloaded,
          lineWidth: 2,
          lineDash: [6, 6],
          endArrow: true,
        },
      });
    }

    currentY += blockHeight + SECTION_GAP;
  });

  return { nodes, edges };
};

const ZoomControls = ({
  disabled,
  zoom,
  onZoomIn,
  onZoomOut,
}: {
  disabled: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) => (
  <div className={styles.zoomControls}>
    <Tooltip content="缩小">
      <Button
        size="small"
        type="secondary"
        icon={<IconMinus />}
        disabled={disabled}
        onClick={onZoomOut}
      />
    </Tooltip>
    <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
    <Tooltip content="放大">
      <Button
        size="small"
        type="secondary"
        icon={<IconPlus />}
        disabled={disabled}
        onClick={onZoomIn}
      />
    </Tooltip>
  </div>
);

const Legend = ({
  controls,
  showControls,
  roleStyles,
  highlight,
}: {
  controls: React.ReactNode;
  showControls: boolean;
  roleStyles: RoleStyleMap;
  highlight: { loaded: string; unloaded: string };
}) => (
  <div className={styles.legend}>
    <div className={styles.legendTitle}>图例</div>
    <div className={styles.legendItems}>
      <div className={styles.legendItem}>
        <div
          className={styles.legendNode}
          style={{
            background: roleStyles.provider.fill,
            border: `1.5px solid ${roleStyles.provider.stroke}`,
          }}
        />
        <span>提供方</span>
      </div>
      <div className={styles.legendItem}>
        <div
          className={styles.legendNode}
          style={{
            background: roleStyles.share.fill,
            border: `1.5px solid ${roleStyles.share.stroke}`,
          }}
        />
        <span>共享模块</span>
      </div>
      <div className={styles.legendItem}>
        <div
          className={styles.legendNode}
          style={{
            background: roleStyles.consumer.fill,
            border: `1.5px solid ${roleStyles.consumer.stroke}`,
          }}
        />
        <span>使用方</span>
      </div>
      <div className={styles.legendItem}>
        <div
          className={styles.legendNode}
          style={{
            background: roleStyles.share.fill,
            border: `2px solid ${highlight.loaded}`,
          }}
        />
        <span>已加载</span>
      </div>
      <div className={styles.legendItem}>
        <div
          className={styles.legendNode}
          style={{
            background: roleStyles.share.fill,
            border: `1.5px dashed ${highlight.unloaded}`,
          }}
        />
        <span>未加载</span>
      </div>
    </div>
    {showControls ? (
      controls
    ) : (
      <div className={styles.zoomControls}>
        <Tooltip content="缩小">
          <Button size="small" type="secondary" icon={<IconMinus />} disabled />
        </Tooltip>
        <span className={styles.zoomLevel}>100%</span>
        <Tooltip content="放大">
          <Button size="small" type="secondary" icon={<IconPlus />} disabled />
        </Tooltip>
      </div>
    )}
  </div>
);

const ShareGraph = (props: ShareGraphProps) => {
  const { shareInfo } = props;

  const [filters, setFilters] = useState<ShareFilters>({
    scope: DEFAULT_SCOPE,
    name: '',
    version: '',
    from: '',
    usedIn: '',
  });
  const [graphZoom, setGraphZoom] = useState(1);
  const [themeStyles, setThemeStyles] = useState<ThemeDrivenStyles>({
    roles: cloneRoleStyles(FALLBACK_ROLE_STYLES),
    labelColor: FALLBACK_LABEL_COLOR,
    highlight: {
      loaded: FALLBACK_LOADED_STROKE,
      unloaded: FALLBACK_UNLOADED_STROKE,
    },
  });

  const graphContainerRef = useRef<HTMLDivElement | null>(null);
  const graphInstanceRef = useRef<G6GraphInstance | null>(null);
  const graphRenderedRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const shareEntries = useMemo<ShareEntry[]>(() => {
    const scopes = shareInfo?.['Share scopes'];
    if (!scopes || typeof scopes !== 'object') {
      return [];
    }
    const result: ShareEntry[] = [];

    Object.entries(scopes as Record<string, Record<string, unknown>>).forEach(
      ([instanceName, scopeMap]) => {
        if (!scopeMap || typeof scopeMap !== 'object') {
          return;
        }
        Object.entries(
          scopeMap as Record<string, Record<string, unknown>>,
        ).forEach(([scopeName, pkgMap]) => {
          if (!pkgMap || typeof pkgMap !== 'object') {
            return;
          }
          Object.entries(
            pkgMap as Record<string, Record<string, unknown>>,
          ).forEach(([pkgName, versionMap]) => {
            if (!versionMap || typeof versionMap !== 'object') {
              return;
            }
            Object.entries(versionMap as Record<string, any>).forEach(
              // eslint-disable-next-line max-nested-callbacks
              ([version, sharedValue]) => {
                if (!sharedValue || typeof sharedValue !== 'object') {
                  return;
                }
                const usedInRaw =
                  sharedValue.usedIn ??
                  sharedValue.useIn ??
                  sharedValue.consumers;
                const usedIn = Array.isArray(usedInRaw)
                  ? usedInRaw
                  : typeof usedInRaw === 'string'
                    ? [usedInRaw]
                    : [];

                const deps = Array.isArray(sharedValue.deps)
                  ? sharedValue.deps
                  : [];

                result.push({
                  id: [instanceName, scopeName, pkgName, version].join('|'),
                  instance: instanceName,
                  scope: scopeName,
                  name: pkgName,
                  version,
                  from:
                    typeof sharedValue.from === 'string'
                      ? sharedValue.from
                      : '',
                  usedIn,
                  deps,
                  eager:
                    typeof sharedValue.eager === 'boolean'
                      ? sharedValue.eager
                      : undefined,
                  loaded:
                    typeof sharedValue.loaded === 'boolean'
                      ? sharedValue.loaded
                      : undefined,
                  strategy:
                    typeof sharedValue.strategy === 'string'
                      ? sharedValue.strategy
                      : undefined,
                  lib: sharedValue.lib,
                });
              },
            );
          });
        });
      },
    );

    return result.sort((a, b) => {
      const aHasConsumers = a.usedIn.length > 0;
      const bHasConsumers = b.usedIn.length > 0;

      if (aHasConsumers && !bHasConsumers) return -1;
      if (!aHasConsumers && bHasConsumers) return 1;

      if (a.name !== b.name) {
        return a.name.localeCompare(b.name);
      }

      return a.version.localeCompare(b.version);
    });
  }, [shareInfo]);

  const filterOptions = useMemo(() => {
    const scopes = new Set<string>();
    const names = new Set<string>();
    const versions = new Set<string>();
    const providers = new Set<string>();
    const consumers = new Set<string>();

    scopes.add(DEFAULT_SCOPE);

    shareEntries.forEach((entry) => {
      scopes.add(entry.scope);
      names.add(entry.name);
      versions.add(entry.version);
      if (entry.from) {
        providers.add(entry.from);
      }
      entry.usedIn.forEach((consumer) => consumers.add(consumer));
    });

    return {
      scopes: Array.from(scopes).sort((a, b) => a.localeCompare(b)),
      names: Array.from(names).sort((a, b) => a.localeCompare(b)),
      versions: Array.from(versions).sort((a, b) => a.localeCompare(b)),
      providers: Array.from(providers).sort((a, b) => a.localeCompare(b)),
      consumers: Array.from(consumers).sort((a, b) => a.localeCompare(b)),
    };
  }, [shareEntries]);

  const filteredEntries = useMemo(() => {
    const { scope, name, version, from, usedIn } = filters;

    return shareEntries.filter((entry) => {
      if (scope && entry.scope !== scope) {
        return false;
      }
      if (name && entry.name !== name) {
        return false;
      }
      if (version && entry.version !== version) {
        return false;
      }
      if (from && entry.from !== from) {
        return false;
      }
      if (usedIn && !entry.usedIn.includes(usedIn)) {
        return false;
      }
      return true;
    });
  }, [shareEntries, filters]);

  const globalPlugins = useMemo(() => {
    const plugins = shareInfo?.['Global plugins'];
    if (!plugins) {
      return [];
    }
    if (Array.isArray(plugins)) {
      return plugins;
    }
    if (typeof plugins === 'object') {
      return Object.values(plugins);
    }
    return [];
  }, [shareInfo]);

  const updateFilter = (key: keyof ShareFilters) => (value?: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'scope' ? (value ?? DEFAULT_SCOPE) : (value ?? ''),
    }));
  };

  useEffect(() => {
    const container = graphContainerRef.current;
    if (!container || graphInstanceRef.current) {
      return;
    }

    const graph = new Graph({
      container,
      width: container.clientWidth,
      height: container.clientHeight,
      padding: [20, 20, 20, 20],
      theme: 'dark',
      behaviors: ['drag-canvas', 'zoom-canvas'],
      node: {
        type: 'rect',
        style: {
          radius: 12,
          lineWidth: 1.5,
          label: true,
          labelFontSize: 12,
          labelLineHeight: 20,
          labelPadding: LABEL_PADDING,
          labelTextAlign: 'left',
          labelTextBaseline: 'top',
        },
      },
      edge: {
        type: 'polyline',
        style: {
          radius: 12,
          lineWidth: 2,
          endArrow: true,
        },
      },
    });

    const runtimeElement = (
      graph as unknown as {
        context?: {
          element?: { getTheme?: (type: 'node' | 'edge' | 'combo') => any };
        };
      }
    ).context?.element;
    const nodeTheme = runtimeElement?.getTheme?.('node') ?? {};
    const edgeTheme = runtimeElement?.getTheme?.('edge') ?? {};
    const paletteColors: string[] = Array.isArray(nodeTheme?.palette?.color)
      ? nodeTheme.palette.color
      : [];

    const baseNodeFill =
      nodeTheme?.style?.fill ?? FALLBACK_ROLE_STYLES.provider.fill;
    const baseNodeStroke =
      nodeTheme?.style?.stroke ?? FALLBACK_ROLE_STYLES.provider.stroke;
    const labelFill = nodeTheme?.style?.labelFill ?? FALLBACK_LABEL_COLOR;
    const edgeStroke = edgeTheme?.style?.stroke ?? FALLBACK_UNLOADED_STROKE;
    const providerFill =
      paletteColors[0] ?? FALLBACK_ROLE_STYLES.provider.fill ?? baseNodeFill;
    const shareFill =
      paletteColors[1] ?? FALLBACK_ROLE_STYLES.share.fill ?? baseNodeFill;
    const consumerFill =
      paletteColors[2] ?? FALLBACK_ROLE_STYLES.consumer.fill ?? baseNodeFill;

    const derivedRoles = cloneRoleStyles(FALLBACK_ROLE_STYLES);
    derivedRoles.provider.fill = providerFill;
    derivedRoles.provider.stroke =
      FALLBACK_ROLE_STYLES.provider.stroke ?? baseNodeStroke;
    derivedRoles.share.fill = shareFill;
    derivedRoles.share.stroke =
      FALLBACK_ROLE_STYLES.share.stroke ??
      nodeTheme?.state?.selected?.stroke ??
      baseNodeStroke;
    derivedRoles.consumer.fill = consumerFill;
    derivedRoles.consumer.stroke =
      FALLBACK_ROLE_STYLES.consumer.stroke ?? baseNodeStroke;
    derivedRoles.placeholder.fill = 'rgba(255, 255, 255, 0.04)';
    derivedRoles.placeholder.stroke =
      FALLBACK_ROLE_STYLES.placeholder.stroke ?? edgeStroke;

    const nextStyles: ThemeDrivenStyles = {
      roles: derivedRoles,
      labelColor: labelFill,
      highlight: {
        loaded: derivedRoles.share.stroke ?? shareFill,
        unloaded: derivedRoles.placeholder.stroke ?? edgeStroke,
      },
    };

    setThemeStyles((prev) =>
      isThemeDrivenStylesEqual(prev, nextStyles) ? prev : nextStyles,
    );

    const resolveZoom = () =>
      typeof graph.getZoom === 'function' ? graph.getZoom() : 1;

    graph.on('aftertransform', () => {
      setGraphZoom(resolveZoom());
    });
    graph.on('afterrender', () => {
      setGraphZoom(resolveZoom());
    });

    graphInstanceRef.current = graph;

    const resizeObserver = new ResizeObserver((entries) => {
      const [{ contentRect }] = entries;
      const width = Math.max(contentRect.width, 200);
      const height = Math.max(contentRect.height, 200);
      graph.setSize(width, height);
    });
    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;

    return () => {
      resizeObserver.disconnect();
      graph.destroy();
      graphInstanceRef.current = null;
      graphRenderedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const graph = graphInstanceRef.current;
    if (!graph) {
      return;
    }

    let cancelled = false;

    const updateGraph = async () => {
      if (!filteredEntries.length) {
        if (typeof graph.clear === 'function') {
          await graph.clear();
        }
        if (cancelled) {
          return;
        }
        graphRenderedRef.current = false;
        if (typeof graph.getZoom === 'function') {
          setGraphZoom(graph.getZoom());
        }
        return;
      }

      const data = buildGraphElements(
        filteredEntries,
        themeStyles.roles,
        themeStyles.labelColor,
        themeStyles.highlight,
      );
      graph.setData(data);
      if (typeof graph.render === 'function') {
        await graph.render();
      }
      if (cancelled) {
        return;
      }
      graphRenderedRef.current = true;
      if (typeof graph.fitView === 'function') {
        await graph.fitView({ when: 'overflow' });
      }
      if (!cancelled && typeof graph.getZoom === 'function') {
        setGraphZoom(graph.getZoom());
      }
    };

    void updateGraph();

    return () => {
      cancelled = true;
    };
  }, [filteredEntries, themeStyles]);

  const handleZoom = useCallback(
    (delta: number) => {
      const graph = graphInstanceRef.current;
      if (!graph) {
        return;
      }
      const currentZoom =
        typeof graph.getZoom === 'function' ? graph.getZoom() : graphZoom;
      const zoomRange =
        typeof graph.getZoomRange === 'function'
          ? graph.getZoomRange()
          : [0.01, 10];
      const [minZoom = 0.01, maxZoom = 10] = zoomRange ?? [];
      const nextZoom = Math.max(
        minZoom,
        Math.min(maxZoom, currentZoom + delta),
      );
      if (Math.abs(nextZoom - currentZoom) < 1e-6) {
        return;
      }
      const size =
        typeof graph.getSize === 'function' ? graph.getSize() : [0, 0];
      const [width, height] = size;
      if (typeof graph.zoomTo === 'function') {
        void graph.zoomTo(nextZoom, undefined, [width / 2, height / 2]);
      }
      setGraphZoom(nextZoom);
    },
    [graphZoom],
  );

  const hasShareEntries = filteredEntries.length > 0;
  const totalEntries = shareEntries.length;

  return (
    <div className={styles.container}>
      <div className={styles.controlBar}>
        <div className={styles.filterGroup}>
          <Select
            size="small"
            placeholder="选择作用域"
            value={filters.scope || DEFAULT_SCOPE}
            onChange={(value) =>
              updateFilter('scope')(
                typeof value === 'string' ? value : DEFAULT_SCOPE,
              )
            }
            className={styles.filterSelect}
            showSearch
          >
            {[
              DEFAULT_SCOPE,
              ...filterOptions.scopes.filter((s) => s !== DEFAULT_SCOPE),
            ].map((scope) => (
              <Option value={scope} key={scope}>
                {scope}
              </Option>
            ))}
          </Select>
          <Select
            allowClear
            size="small"
            placeholder="选择共享依赖"
            value={filters.name || undefined}
            onChange={(value) =>
              updateFilter('name')(
                typeof value === 'string' ? value : undefined,
              )
            }
            className={styles.filterSelect}
            showSearch
          >
            {filterOptions.names.map((name) => (
              <Option value={name} key={name}>
                {name}
              </Option>
            ))}
          </Select>
          <Select
            allowClear
            size="small"
            placeholder="选择版本"
            value={filters.version || undefined}
            onChange={(value) =>
              updateFilter('version')(
                typeof value === 'string' ? value : undefined,
              )
            }
            className={styles.filterSelect}
            showSearch
          >
            {filterOptions.versions.map((version) => (
              <Option value={version} key={version}>
                {version}
              </Option>
            ))}
          </Select>
          <Select
            allowClear
            size="small"
            placeholder="选择提供方"
            value={filters.from || undefined}
            onChange={(value) =>
              updateFilter('from')(
                typeof value === 'string' ? value : undefined,
              )
            }
            className={styles.filterSelect}
            showSearch
          >
            {filterOptions.providers.map((provider) => (
              <Option value={provider} key={provider}>
                {provider}
              </Option>
            ))}
          </Select>
          <Select
            allowClear
            size="small"
            placeholder="选择使用方"
            value={filters.usedIn || undefined}
            onChange={(value) =>
              updateFilter('usedIn')(
                typeof value === 'string' ? value : undefined,
              )
            }
            className={styles.filterSelect}
            showSearch
          >
            {filterOptions.consumers.map((consumer) => (
              <Option value={consumer} key={consumer}>
                {consumer}
              </Option>
            ))}
          </Select>
        </div>
        <div className={styles.summary}>
          <span className={styles.summaryHighlight}>
            {filteredEntries.length}
          </span>
          <span className={styles.summaryText}>
            个共享依赖（共 {totalEntries} 个）
          </span>
        </div>
      </div>

      <Legend
        showControls={hasShareEntries}
        controls={
          <ZoomControls
            zoom={graphZoom}
            disabled={!hasShareEntries}
            onZoomIn={() => handleZoom(0.1)}
            onZoomOut={() => handleZoom(-0.1)}
          />
        }
        roleStyles={themeStyles.roles}
        highlight={themeStyles.highlight}
      />

      {hasShareEntries ? (
        <div className={styles.graphBoard}>
          <div ref={graphContainerRef} className={styles.graphCanvas} />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Empty description={'没有匹配的共享依赖'} />
        </div>
      )}

      {globalPlugins.length ? (
        <div className={styles.pluginSection}>
          <div className={styles.pluginTitle}>全局插件</div>
          <div className={styles.pluginList}>
            {globalPlugins.map((plugin, index) => (
              <div className={styles.pluginCard} key={index}>
                <div className={styles.nodeTitle}>
                  {plugin?.name || `插件 ${index + 1}`}
                </div>
                <pre className={styles.cardContent}>
                  {JSON.stringify(plugin, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ShareGraph;
