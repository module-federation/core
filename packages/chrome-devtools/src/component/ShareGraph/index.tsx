/* eslint-disable max-lines */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import G6 from '@antv/g6';
import type { Graph } from '@antv/g6';
import { Message } from '@arco-design/web-react';
import {
  normalizeGlobalShare,
  validateNormalized,
  safeStringify,
} from './adapter';
import type { AppState, Normalized } from './global';
import styles from './styles.module.scss';

type Level = 1 | 2 | 3;

const DEFAULT_SHARE_SCOPE = 'default';
// 定义节点和边的类型
interface G6Node {
  id: string;
  label: string;
  dataType: 'share' | 'version' | 'consumer' | 'provider' | 'provider-note';
  scope?: string;
  share?: string;
  version?: string;
  consumer?: string;
  provider?: string;
  instance?: string;
  type: 'circle' | 'rect' | 'version-node';
  style: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
    cursor: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    lineDash?: number[];
  };
  size: number | [number, number];
  labelCfg: {
    position: 'center';
    style: {
      fill: string;
      fontSize: number;
      fontWeight?: string | number;
    };
  };
  draggable: boolean;
  mass: number;
  fx: number | null;
  fy: number | null;
  x?: number;
  y?: number;
  instanceCount?: number;
}

interface G6Edge {
  source: string;
  target: string;
  style: {
    stroke: string;
    strokeWidth: number;
    opacity: number;
    endArrow?: {
      path: string;
      fill: string;
      stroke: string;
    };
    lineDash?: number[];
  };
  strength?: number;
}

interface ShareGraphProps {
  className?: string;
  shareInfo?: Record<string, unknown>;
}

const getFontSize = (loaded: boolean, fontSize?: number) => {
  if (fontSize) {
    return fontSize;
  }
  return loaded ? 11 : 10;
};

const calcSize = (
  label: string,
  loaded: boolean,
  base = 1,
  fontSize?: number,
) => {
  const textWidth = label.length * getFontSize(loaded, fontSize) * base;
  return textWidth / 2;
};

const ShareGraph: React.FC<ShareGraphProps> = ({ className, shareInfo }) => {
  // 全局状态
  const [state, setState] = useState<AppState>({
    normalized: {},
    currentScope: null,
    currentShare: null,
    currentVersion: null,
    level: 1,
    mode: 'g6',
    lastError: null,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [g6Initialized, setG6Initialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph>(null);

  // 初始化G6图形
  const initGraph = useCallback(
    (
      container: HTMLDivElement,
      onNodeClick: (model: G6Node) => void,
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        console.log('initGraph 开始');

        if (!container) {
          reject(new Error('容器元素不存在'));
          return;
        }

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;

        try {
          const graph = new G6.Graph({
            container,
            width,
            height,
            layout: {
              type: 'force',
              linkDistance: 250,
              nodeStrength: -400,
              edgeStrength: 0.05,
              nodeSize: 60,
              minMovement: 0.5,
              maxIteration: 1500,
              damping: 0.8,
              preventOverlap: true,
              collideStrength: 0.5,
            },
            modes: {
              default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
            },
            defaultNode: {
              type: 'circle',
              size: 30,
              style: {
                fill: '#fff',
                stroke: '#cbd5e1',
                strokeWidth: 2,
                cursor: 'pointer',
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowBlur: 6,
                shadowOffsetX: 2,
                shadowOffsetY: 2,
              },
              labelCfg: {
                position: 'center',
                style: {
                  fontSize: 12,
                  fill: '#0f172a',
                  fontWeight: 500,
                  textAlign: 'center',
                  textBaseline: 'middle',
                },
              },
              draggable: true,
            },
            defaultEdge: {
              type: 'cubic-horizontal',
              style: {
                stroke: '#94a3b8',
                strokeWidth: 2,
                endArrow: {
                  path: 'M 0,0 L 8,4 L 8,-4 Z',
                  fill: '#94a3b8',
                  stroke: '#94a3b8',
                },
                shadowColor: 'rgba(148, 163, 184, 0.2)',
                shadowBlur: 3,
                opacity: 0.8,
              },
            },
            fitView: true,
            fitViewPadding: 20,
            animate: true,
            groupByTypes: false,
          });

          // 注册自定义节点，用于显示徽标
          G6.registerNode('version-node', {
            draw(cfg, group) {
              const { size, color, style, label, instanceCount } = cfg;
              const r = (size as number) / 2;

              const {
                fill,
                stroke,
                strokeWidth,
                lineDash,
                cursor,
                opacity,
                shadowColor,
                shadowBlur,
                fontSize,
                fontWeight,
              } = style || {};
              // 绘制主圆形
              const mainCircle = group.addShape('circle', {
                attrs: {
                  x: 0,
                  y: 0,
                  r,
                  fill: color || fill,
                  stroke,
                  strokeWidth,
                  lineDash,
                  cursor,
                  opacity,
                  shadowColor,
                  shadowBlur,
                },
              });

              // 绘制标签
              if (label) {
                group.addShape('text', {
                  attrs: {
                    x: 0,
                    y: 0,
                    text: label,
                    fontSize: fontSize || 10,
                    fontWeight: fontWeight || 'normal',
                    fill: '#ffffff',
                    textAlign: 'center',
                    textBaseline: 'middle',
                  },
                });
              }

              // 如果有实例数量，绘制徽标
              if (
                !Number.isNaN(instanceCount) &&
                (instanceCount as number) > 1
              ) {
                const badgeSize = Math.max(
                  12,
                  Math.min(18, 8 + (instanceCount as number)),
                );
                const badgeX = r - badgeSize / 2;
                const badgeY = -r + badgeSize / 2;

                // 绘制徽标背景
                group.addShape('circle', {
                  attrs: {
                    x: badgeX,
                    y: badgeY,
                    r: badgeSize / 2,
                    fill: '#ef4444',
                    stroke: '#ffffff',
                    strokeWidth: 1,
                    opacity: 0.9,
                  },
                });

                // 绘制徽标文本
                group.addShape('text', {
                  attrs: {
                    x: badgeX,
                    y: badgeY,
                    text: String(instanceCount),
                    fontSize: Math.max(8, Math.min(12, badgeSize / 2)),
                    fontWeight: 'bold',
                    fill: '#ffffff',
                    textAlign: 'center',
                    textBaseline: 'middle',
                  },
                });
              }

              return mainCircle;
            },
          });

          // 设置 graphRef.current
          graphRef.current = graph;

          // 添加事件监听器
          graph.on(
            'node:click',
            (ev: { item?: { getModel?: () => G6Node } }) => {
              const model = ev?.item?.getModel?.();
              if (!model) {
                return;
              }
              onNodeClick(model);
            },
          );

          // 直接resolve，不需要等待
          resolve();
        } catch (e) {
          console.error('创建 G6 图形失败:', e);
          reject(e);
        }
      });
    },
    [],
  );

  // 安全更新G6数据
  const safeChangeData = useCallback((nodes: G6Node[], edges: G6Edge[]) => {
    const graph = graphRef.current;

    if (!graph) {
      console.error('graph不可用，直接降级');
      return false;
    }

    try {
      if (nodes.length > 1200 || edges.length > 2000) {
        throw new Error('数据量过大，降级');
      }

      // 获取当前图形数据
      const currentData = graph.save();
      const currentNodes: G6Node[] = (currentData?.nodes as G6Node[]) || [];

      // 检查是否需要更新数据
      const needsUpdate =
        nodes.length !== currentNodes.length ||
        nodes.some((node) => !currentNodes.find((n) => n.id === node.id));

      if (!needsUpdate) {
        console.log('数据未变化，跳过更新');
        return true;
      }

      // 为节点设置初始位置，避免聚集在一起
      const optimizedNodes = nodes.map((node) => {
        // 根据节点类型设置不同的初始位置
        if (node.dataType === 'share') {
          // 第一层级的大节点，按圆形分布
          const shareNodes = nodes.filter((n) => n.dataType === 'share');
          const shareIndex = shareNodes.indexOf(node);
          const angle = (shareIndex / shareNodes.length) * Math.PI * 2;
          const radius = 300;
          return {
            ...node,
            x: 400 + Math.cos(angle) * radius,
            y: 300 + Math.sin(angle) * radius,
          };
        } else if (node.dataType === 'version') {
          // 版本节点，围绕对应的share节点分布
          const parentNode = nodes.find(
            (n) => n.id === `share:${node.scope}:${node.share}`,
          );
          if (parentNode) {
            const versionNodes = nodes.filter(
              (n) => n.dataType === 'version' && n.share === node.share,
            );
            const versionIndex = versionNodes.indexOf(node);
            const angle = (versionIndex / versionNodes.length) * Math.PI * 2;
            const radius = 150;
            return {
              ...node,
              x: (parentNode.x || 0) + Math.cos(angle) * radius,
              y: (parentNode.y || 0) + Math.sin(angle) * radius,
            };
          }
          return {
            ...node,
            x: 400 + Math.random() * 300 - 150,
            y: 300 + Math.random() * 300 - 150,
          };
        } else if (
          node.dataType === 'consumer' ||
          node.dataType === 'provider'
        ) {
          // 第三层级的提供者和消费者节点，围绕主节点分布
          const parentNode = nodes.find(
            (n) => n.dataType === 'share' && n.share === node.share,
          );
          if (parentNode) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 220;
            return {
              ...node,
              x: (parentNode.x || 0) + Math.cos(angle) * radius,
              y: (parentNode.y || 0) + Math.sin(angle) * radius,
            };
          }
          return {
            ...node,
            x: 400 + Math.random() * 300 - 150,
            y: 300 + Math.random() * 300 - 150,
          };
        }

        // 默认位置
        return {
          ...node,
          x: 400 + Math.random() * 300 - 150,
          y: 300 + Math.random() * 300 - 150,
        };
      });

      // 使用G6 4.x版本的数据更新方法
      graph.data({ nodes: optimizedNodes, edges, id: 'root' });
      graph.render();

      // 只在必要时重新计算布局
      if (needsUpdate) {
        // 强制重新计算布局
        if (typeof graph.updateLayout === 'function') {
          graph.updateLayout({
            type: 'force',
            linkDistance: 250,
            nodeStrength: -400,
            edgeStrength: 0.05,
            minMovement: 0.5,
            maxIteration: 1500,
            damping: 0.8,
            preventOverlap: true,
            collideStrength: 0.5,
          });

          // 直接适配视图，不延迟
          if (typeof graph.fitView === 'function') {
            graph.fitView(30);
          }
        }
      }

      return true;
    } catch (e) {
      console.error('safeChangeData 降级：', e);
      return false;
    }
  }, []);

  // 第一层级：展示所有share，按shareName分组
  const renderLevel1 = useCallback(
    (
      normalized: Normalized,
      onlyScope = DEFAULT_SHARE_SCOPE,
    ): { nodes: G6Node[]; edges: G6Edge[] } => {
      const nodes: G6Node[] = [];
      const edges: G6Edge[] = [];
      const scopes = onlyScope ? [onlyScope] : Object.keys(normalized || {});
      // 为每个shareName生成一个颜色
      const shareColors: Record<string, string> = {};
      let colorIndex = 0;
      const colors = [
        '#3b82f6',
        '#ef4444',
        '#10b981',
        '#f59e0b',
        '#8b5cf6',
        '#ec4899',
        '#14b8a6',
        '#f97316',
        '#06b6d4',
        '#84cc16',
      ];

      // 收集所有shareName并分配颜色
      for (const scope of scopes) {
        const shares = normalized[scope] || {};
        for (const shareName of Object.keys(shares)) {
          if (!shareColors[shareName]) {
            shareColors[shareName] = colors[colorIndex % colors.length];
            colorIndex++;
          }
        }
      }

      // 创建节点和边
      for (const scope of scopes) {
        const shares = normalized[scope] || {};
        for (const [shareName, shareInfo] of Object.entries(shares)) {
          const versions = Object.keys(shareInfo?.versions || {});
          const baseColor = shareColors[shareName];
          // 创建大节点（shareName）
          nodes.push({
            id: `share:${scope}:${shareName}`,
            label: shareName,
            dataType: 'share',
            scope,
            share: shareName,
            type: 'circle',
            style: {
              fill: baseColor,
              stroke: baseColor,
              strokeWidth: 2,
              opacity: 0.9,
              cursor: 'pointer',
            },
            size: calcSize(shareName, false, 2.2),
            labelCfg: {
              position: 'center',
              style: {
                fill: '#ffffff',
                fontSize: 12,
                fontWeight: 'bold',
              },
            },
            draggable: true,
            mass: 2,
            fx: null,
            fy: null,
          });

          // 创建小节点（版本）
          versions.forEach((version) => {
            const versionInfos = shareInfo.versions[version];
            const instanceCount = versionInfos?.length || 0;
            const loaded = versionInfos.some((v) => v.loaded);

            nodes.push({
              id: `version:${scope}:${shareName}:${version}`,
              label: version,
              dataType: 'version',
              scope,
              share: shareName,
              version,
              type: 'version-node',
              style: {
                fill: baseColor,
                stroke: '#ffffff',
                strokeWidth: loaded ? 3 : 2,
                opacity: loaded ? 0.8 : 0.5,
                cursor: 'pointer',
                shadowColor: loaded ? baseColor : 'transparent',
                shadowBlur: loaded ? 10 : 0,
                lineDash: loaded ? undefined : [3, 3],
              },
              size: calcSize(version, loaded),
              labelCfg: {
                position: 'center',
                style: {
                  fill: '#ffffff',
                  fontSize: getFontSize(loaded),
                  fontWeight: loaded ? 'bold' : 'normal',
                },
              },
              draggable: true,
              mass: 1,
              fx: null,
              fy: null,
              instanceCount,
            });

            // 连接大节点和小节点
            edges.push({
              source: `share:${scope}:${shareName}`,
              target: `version:${scope}:${shareName}:${version}`,
              style: {
                stroke: baseColor,
                strokeWidth: loaded ? 2 : 1.5,
                opacity: loaded ? 0.9 : 0.7,
                endArrow: {
                  path: 'M 0,0 L 6,3 L 6,-3 Z',
                  fill: baseColor,
                  stroke: baseColor,
                },
              },
              strength: 0.2,
            });
          });
        }
      }

      // 创建不同组之间的连线（只连接大节点，组成一个圈）
      const shareNodes = nodes.filter((n) => n.dataType === 'share');
      for (let i = 0; i < shareNodes.length; i++) {
        const currentNode = shareNodes[i];
        const nextNode = shareNodes[(i + 1) % shareNodes.length];

        edges.push({
          source: currentNode.id,
          target: nextNode.id,
          style: {
            stroke: '#94a3b8',
            strokeWidth: 1,
            opacity: 0.3,
            lineDash: [5, 5],
          },
          strength: 0.05,
        });
      }

      return { nodes, edges };
    },
    [],
  );

  // 第二层级：展示特定shareName的所有版本（放大显示）
  const renderLevel2 = useCallback(
    (
      normalized: Normalized,
      scope: string,
      shareName: string,
    ): { nodes: G6Node[]; edges: G6Edge[] } => {
      const nodes: G6Node[] = [];
      const edges: G6Edge[] = [];
      const shareInfo = normalized[scope]?.[shareName];
      if (!shareInfo) {
        return { nodes, edges };
      }

      const versions = Object.keys(shareInfo?.versions || {});
      const baseColor = '#3b82f6';

      // 创建大节点（shareName）- 放大版本
      nodes.push({
        id: `share:${scope}:${shareName}`,
        label: shareName,
        dataType: 'share',
        scope,
        share: shareName,
        type: 'circle',
        style: {
          fill: baseColor,
          stroke: baseColor,
          strokeWidth: 3,
          opacity: 0.9,
          cursor: 'pointer',
        },
        size: calcSize(shareName, false, 2.2),
        labelCfg: {
          position: 'center',
          style: {
            fill: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        draggable: true,
        mass: 3,
        fx: null,
        fy: null,
      });

      // 创建小节点（版本）- 放大版本
      versions.forEach((version) => {
        const versionInfos = shareInfo.versions[version];
        const instanceCount = versionInfos?.length || 0;
        const loaded = versionInfos.some((v) => v.loaded);

        nodes.push({
          id: `version:${scope}:${shareName}:${version}`,
          label: version,
          dataType: 'version',
          scope,
          share: shareName,
          version,
          type: 'version-node',
          style: {
            fill: baseColor,
            stroke: '#ffffff',
            strokeWidth: loaded ? 4 : 3,
            opacity: loaded ? 1 : 0.6,
            cursor: 'pointer',
            shadowColor: loaded ? baseColor : 'transparent',
            shadowBlur: loaded ? 15 : 0,
            lineDash: loaded ? undefined : [4, 4],
          },
          size: calcSize(version, loaded),
          labelCfg: {
            position: 'center',
            style: {
              fill: '#ffffff',
              fontSize: loaded ? 13 : 12,
              fontWeight: loaded ? 'bold' : 'normal',
            },
          },
          draggable: true,
          mass: 2,
          fx: null,
          fy: null,
          instanceCount,
        });

        // 连接大节点和小节点
        edges.push({
          source: `share:${scope}:${shareName}`,
          target: `version:${scope}:${shareName}:${version}`,
          style: {
            stroke: baseColor,
            strokeWidth: loaded ? 2.5 : 2,
            opacity: loaded ? 0.9 : 0.8,
            endArrow: {
              path: 'M 0,0 L 8,4 L 8,-4 Z',
              fill: baseColor,
              stroke: baseColor,
            },
          },
          strength: 0.3,
        });
      });

      return { nodes, edges };
    },
    [],
  );

  // 第三层级：展示提供者和消费者关系
  const renderLevel3 = useCallback(
    (
      normalized: Normalized,
      scope: string,
      shareName: string,
      version: string,
    ): { nodes: G6Node[]; edges: G6Edge[] } => {
      const nodes: G6Node[] = [];
      const edges: G6Edge[] = [];
      const versionInfos = normalized[scope]?.[shareName]?.versions?.[version];
      if (
        !versionInfos ||
        !Array.isArray(versionInfos) ||
        versionInfos.length === 0
      ) {
        return { nodes, edges };
      }

      // 为每个版本信息创建节点
      versionInfos.forEach((versionInfo) => {
        const { instance } = versionInfo;
        const labelText = `${shareName}@${version}`;
        const fontSize = 14;
        const textWidth = labelText.length * fontSize * 0.6; // 估算文本宽度
        const nodeWidth = Math.max(120, textWidth + 20); // 最小宽度120px，加上内边距
        const nodeHeight = Math.max(80, textWidth + 40); // 增加高度以容纳备注

        // 检查是否加载
        const isLoaded = versionInfo?.loaded || false;

        nodes.push({
          id: `share:${scope}:${shareName}:${instance}`,
          label: isLoaded
            ? `${shareName}@${version}\n(loaded)`
            : `${shareName}@${version}`,
          dataType: 'share',
          scope,
          share: shareName,
          version,
          instance,
          type: 'rect',
          style: {
            fill: isLoaded ? '#059669' : '#10b981',
            stroke: '#ffffff',
            strokeWidth: isLoaded ? 4 : 2,
            opacity: isLoaded ? 1 : 0.5,
            cursor: 'pointer',
            lineDash: isLoaded ? undefined : [3, 3],
            shadowColor: isLoaded ? '#059669' : 'transparent',
            shadowBlur: isLoaded ? 10 : 0,
          },
          size: [nodeWidth, nodeHeight],
          labelCfg: {
            position: 'center',
            style: {
              fill: '#ffffff',
              fontSize,
              fontWeight: 'bold',
            },
          },
          draggable: true,
          mass: 3,
          fx: null,
          fy: null,
        });

        // 添加备注节点（from: 提供者）
        nodes.push({
          id: `provider-note:${scope}:${shareName}:${version}:${instance}`,
          label: `from: ${instance}`,
          dataType: 'provider-note',
          scope,
          share: shareName,
          version,
          instance,
          type: 'rect',
          style: {
            fill: '#ef4444',
            stroke: '#ef4444',
            strokeWidth: 2,
            opacity: 0.8,
            cursor: 'pointer',
          },
          size: [Math.max(100, instance.length * 8 + 20), 30],
          labelCfg: {
            position: 'center',
            style: {
              fill: '#ffffff',
              fontSize: 12,
            },
          },
          draggable: true,
          mass: 2,
          fx: null,
          fy: null,
        });

        // 连接备注节点到主节点
        edges.push({
          source: `provider-note:${scope}:${shareName}:${version}:${instance}`,
          target: `share:${scope}:${shareName}:${instance}`,
          style: {
            stroke: '#ef4444',
            strokeWidth: 3,
            opacity: 0.9,
            endArrow: {
              path: 'M 0,0 L 8,4 L 8,-4 Z',
              fill: '#ef4444',
              stroke: '#ef4444',
            },
          },
          strength: 0.3,
        });

        // 创建消费者节点
        const consumers = versionInfo.consumers || [];
        consumers.forEach((consumer, consumerIndex) => {
          const fontSize = 12;
          const textWidth = consumer.length * fontSize * 0.6; // 估算文本宽度
          const nodeSize = Math.max(50, textWidth + 20); // 最小尺寸50px，加上内边距

          nodes.push({
            id: `consumer:${scope}:${shareName}:${version}:${instance}:${consumerIndex}`,
            label: consumer,
            dataType: 'consumer',
            scope,
            share: shareName,
            version,
            instance,
            consumer,
            type: 'circle',
            style: {
              fill: '#8b5cf6',
              stroke: '#8b5cf6',
              strokeWidth: 2,
              opacity: 0.8,
              cursor: 'pointer',
            },
            size: nodeSize,
            labelCfg: {
              position: 'center',
              style: {
                fill: '#ffffff',
                fontSize,
              },
            },
            draggable: true,
            mass: 1.5,
            fx: null,
            fy: null,
          });

          // 连接消费者到主节点
          edges.push({
            source: `consumer:${scope}:${shareName}:${version}:${instance}:${consumerIndex}`,
            target: `share:${scope}:${shareName}:${instance}`,
            style: {
              stroke: '#8b5cf6',
              strokeWidth: 3,
              opacity: 0.9,
              endArrow: {
                path: 'M 0,0 L 8,4 L 8,-4 Z',
                fill: '#8b5cf6',
                stroke: '#8b5cf6',
              },
            },
            strength: 0.3,
          });
        });
      });

      return { nodes, edges };
    },
    [],
  );

  // 根据状态渲染 - 移到最前面，避免循环依赖
  const renderByState = useCallback(
    (currentState: AppState) => {
      // 如果正在渲染，跳过
      if (isRendering) {
        console.log('正在渲染中，跳过');
        return;
      }

      // 检查状态是否真的发生了变化
      if (
        currentState.normalized === state.normalized &&
        currentState.currentScope === state.currentScope &&
        currentState.currentShare === state.currentShare &&
        currentState.currentVersion === state.currentVersion &&
        currentState.level === state.level
      ) {
        console.log('状态未变化，跳过渲染');
        return;
      }

      try {
        console.log('renderByState');

        // 设置渲染状态
        setIsRendering(true);

        const { normalized } = currentState;

        if (currentState.level === 1) {
          const { nodes, edges } = renderLevel1(
            normalized,
            currentState.currentScope || undefined,
          );
          const ok = safeChangeData(nodes, edges);
          if (!ok) {
            setErrorMessage('图形渲染失败，请检查浏览器控制台获取更多信息');
            return;
          }
        } else if (
          currentState.level === 2 &&
          currentState.currentScope &&
          currentState.currentShare
        ) {
          const { nodes, edges } = renderLevel2(
            normalized,
            currentState.currentScope,
            currentState.currentShare,
          );
          const ok = safeChangeData(nodes, edges);
          if (!ok) {
            setErrorMessage('图形渲染失败，请检查浏览器控制台获取更多信息');
            return;
          }
        } else if (
          currentState.level === 3 &&
          currentState.currentScope &&
          currentState.currentShare &&
          currentState.currentVersion
        ) {
          const { nodes, edges } = renderLevel3(
            normalized,
            currentState.currentScope,
            currentState.currentShare,
            currentState.currentVersion,
          );
          const ok = safeChangeData(nodes, edges);
          if (!ok) {
            setErrorMessage('图形渲染失败，请检查浏览器控制台获取更多信息');
            return;
          }
        } else {
          // 状态不完整，回退到第一层级，全局
          const { nodes, edges } = renderLevel1(normalized, undefined);
          const ok = safeChangeData(nodes, edges);
          if (!ok) {
            setErrorMessage('图形渲染失败，请检查浏览器控制台获取更多信息');
            return;
          }
        }

        // 清除错误信息
        setErrorMessage(null);
      } catch (e: unknown) {
        const errorMsg = `渲染失败：${(e as Error)?.message}`;
        console.error('渲染失败:', e);
        setState((prev) => {
          const newState = { ...prev, lastError: errorMsg };
          console.log('状态更新(渲染失败):', newState);
          return newState;
        });
        setErrorMessage(errorMsg);
      } finally {
        // 重置渲染状态
        setIsRendering(false);
      }
    },
    [isRendering],
  );

  // 窗口大小调整处理
  useEffect(() => {
    const handleResize = () => {
      const graph = graphRef.current;
      const container = graphContainerRef.current;

      if (graph && container) {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        if (typeof graph.changeSize === 'function') {
          graph.changeSize(newW, newH);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 节点点击处理
  const onNodeClick = useCallback((model: G6Node) => {
    try {
      const type = model?.dataType;
      console.log('onNodeClick');

      if (type === 'share') {
        console.log('节点点击: share', {
          scope: model.scope,
          share: model.share,
        });
        setState((prev) => {
          const newState = {
            ...prev,
            level: 2 as Level,
            currentScope: model.scope || null,
            currentShare: model.share || null,
            currentVersion: null,
          };
          console.log('状态更新(share点击):', newState);
          return newState;
        });

        // 确保视图居中
        setTimeout(() => {
          const graph = graphRef.current;
          if (graph && typeof graph.fitView === 'function') {
            graph.fitView(30);
          }
        }, 100);
      } else if (type === 'version') {
        console.log('节点点击: version', {
          scope: model.scope,
          share: model.share,
          version: model.version,
        });
        setState((prev) => {
          const newState = {
            ...prev,
            level: 3 as Level,
            currentScope: model.scope || null,
            currentShare: model.share || null,
            currentVersion: model.version || null,
          };
          console.log('状态更新(version点击):', newState);
          return newState;
        });

        // 确保视图居中
        setTimeout(() => {
          const graph = graphRef.current;
          if (graph && typeof graph.fitView === 'function') {
            graph.fitView(30);
          }
        }, 100);
      }
    } catch (e: unknown) {
      const errorMsg = `节点点击处理失败：${(e as Error)?.message}`;
      console.error('节点点击处理失败:', e);
      setState((prev) => {
        const newState = {
          ...prev,
          lastError: errorMsg,
        };
        console.log('状态更新(节点点击错误):', newState);
        return newState;
      });
      // 使用函数形式获取最新的state.mode
      setState((currentState) => {
        return currentState;
      });
    }
  }, []);

  // 面包屑点击处理
  const handleBreadcrumbClick = useCallback(
    (
      level: string,
      scope?: string | null,
      share?: string | null,
      version?: string | null,
    ) => {
      console.log('面包屑点击:', { level, scope, share, version });

      if (level === 'all') {
        setState((prev) => {
          const newState = {
            ...prev,
            level: 1 as Level,
            currentShare: null,
            currentVersion: null,
          };
          console.log('状态更新(面包屑-all):', newState);
          return newState;
        });

        // 确保视图居中
        setTimeout(() => {
          const graph = graphRef.current;
          if (graph && typeof graph.fitView === 'function') {
            graph.fitView(30);
          }
        }, 100);
      } else if (level === 'scope') {
        setState((prev) => {
          const newState = {
            ...prev,
            level: 1 as Level,
            currentScope: scope || null,
            currentShare: null,
            currentVersion: null,
          };
          console.log('状态更新(面包屑-scope):', newState);
          return newState;
        });

        // 确保视图居中
        setTimeout(() => {
          const graph = graphRef.current;
          if (graph && typeof graph.fitView === 'function') {
            graph.fitView(30);
          }
        }, 100);
      } else if (level === 'share') {
        setState((prev) => {
          const newState = {
            ...prev,
            level: 2 as Level,
            currentScope: scope || null,
            currentShare: share || null,
            currentVersion: null,
          };
          console.log('状态更新(面包屑-share):', newState);
          return newState;
        });

        // 确保视图居中
        setTimeout(() => {
          const graph = graphRef.current;
          if (graph && typeof graph.fitView === 'function') {
            graph.fitView(30);
          }
        }, 100);
      } else if (level === 'version') {
        setState((prev) => {
          const newState = {
            ...prev,
            level: 3 as Level,
            currentScope: scope || null,
            currentShare: share || null,
            currentVersion: version || null,
          };
          console.log('状态更新(面包屑-version):', newState);
          return newState;
        });

        // 确保视图居中
        setTimeout(() => {
          const graph = graphRef.current;
          if (graph && typeof graph.fitView === 'function') {
            graph.fitView(30);
          }
        }, 100);
      }
    },
    [],
  );

  // 初始化G6
  useEffect(() => {
    // 初始化G6，React的useEffect会在DOM渲染完成后自动执行
    (async () => {
      try {
        console.log('useEffect onNodeClick');
        // 检查容器是否存在
        if (!graphContainerRef.current) {
          console.error('找不到容器元素: graphContainer');
          setState((prev) => {
            const newState = {
              ...prev,
              lastError: '找不到容器元素: graphContainer',
            };
            console.log('状态更新(找不到容器元素):', newState);
            return newState;
          });
          setErrorMessage('找不到容器元素: graphContainer');
          return;
        }

        await initGraph(graphContainerRef.current, onNodeClick);
        console.log('G6初始化成功');
        setG6Initialized(true);

        // G6初始化完成后，加载数据
        try {
          if (!shareInfo) {
            throw new Error('未提供示例数据');
          }

          console.log('开始加载shareInfo数据');
          const normalized = normalizeGlobalShare(shareInfo);
          if (!validateNormalized(normalized)) {
            throw new Error(
              '示例数据校验失败：缺少有效的 scope/share/version 结构',
            );
          }

          // 直接渲染，不触发状态更新
          const { nodes, edges } = renderLevel1(
            normalized,
            DEFAULT_SHARE_SCOPE,
          );
          safeChangeData(nodes, edges);

          // 确保节点在视图中间
          setTimeout(() => {
            const graph = graphRef.current;
            if (graph && typeof graph.fitView === 'function') {
              graph.fitView(30);
            }
          }, 50);

          // 直接更新状态，不延迟
          setState((prev) => {
            const newState: AppState = {
              ...prev,
              normalized,
              lastError: null,
              level: 1,
              currentScope: null,
              currentShare: null,
              currentVersion: null,
            };
            console.log('状态更新(G6初始化后加载数据):', newState);
            return newState;
          });
        } catch (e: unknown) {
          const errorMsg = `初始示例数据加载失败：${(e as Error)?.message}`;
          console.error('初始示例数据加载失败:', e);
          setState((prev) => {
            const newState = { ...prev, lastError: errorMsg };
            console.log('状态更新(初始示例数据加载失败):', newState);
            return newState;
          });
        }
      } catch (e: unknown) {
        const errorMsg = `G6初始化失败：${(e as Error)?.message}`;
        console.error('G6初始化失败:', e);
        setState((prev) => {
          const newState = {
            ...prev,
            lastError: errorMsg,
          };
          console.log('状态更新(G6初始化失败):', newState);
          return newState;
        });
        setErrorMessage(errorMsg);
      }
    })();
  }, [onNodeClick, renderLevel1, safeChangeData, shareInfo]);

  // 当状态变化时重新渲染
  useEffect(() => {
    if (state.normalized && g6Initialized) {
      renderByState(state);
    }
  }, [
    state.normalized,
    state.currentScope,
    state.currentShare,
    state.currentVersion,
    state.level,
    g6Initialized,
    renderByState,
  ]);

  // ShareScope选择器变化处理
  const handleScopeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      console.log('handleScopeChange');

      const selectedScope = e.target.value;
      console.log('ShareScope选择器变化:', selectedScope);

      const newState = {
        ...state,
        currentScope:
          selectedScope === DEFAULT_SHARE_SCOPE ? null : selectedScope,
        currentShare: null,
        currentVersion: null,
        level: 1 as Level,
      };

      console.log('状态更新(ShareScope选择器变化):', newState);
      setState(newState);
    } catch (e: unknown) {
      const errorMsg = `切换Scope失败：${(e as Error)?.message}`;
      console.error('切换Scope失败:', e);
      setState((prev) => {
        const newState = { ...prev, lastError: errorMsg };
        console.log('状态更新(切换Scope失败):', newState);
        return newState;
      });
    }
  };

  // ShareName选择器变化处理
  const handleShareNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      console.log('handleShareNameChange');

      const selectedShareName = e.target.value;
      console.log('ShareName选择器变化:', selectedShareName);

      if (!selectedShareName) {
        // 如果选择了空值，回到第一层级
        const newState = {
          ...state,
          currentShare: null,
          currentVersion: null,
          level: 1 as Level,
        };

        console.log('状态更新(ShareName选择器变化):', newState);
        setState(newState);
        // 确保视图居中
        setTimeout(() => {
          const graph = graphRef.current;
          if (graph && typeof graph.fitView === 'function') {
            graph.fitView(30);
          }
        }, 100);
        return;
      }

      // 如果选择了shareName，需要确定是哪个scope
      let targetScope = state.currentScope;

      // 如果没有选择scope，需要查找包含该shareName的scope
      if (!targetScope) {
        Object.keys(state.normalized).forEach((scope) => {
          if (state.normalized[scope]?.[selectedShareName]) {
            targetScope = scope;
          }
        });
      }

      // 如果选择了shareName，进入第二层级
      const newState = {
        ...state,
        currentScope: targetScope,
        currentShare: selectedShareName,
        currentVersion: null,
        level: 2 as Level,
      };

      console.log('状态更新(ShareName选择器变化):', newState);
      setState(newState);
      // 确保视图居中
      setTimeout(() => {
        const graph = graphRef.current;
        if (graph && typeof graph.fitView === 'function') {
          graph.fitView(30);
        }
      }, 100);
    } catch (e: unknown) {
      const errorMsg = `切换ShareName失败：${(e as Error)?.message}`;
      console.error('切换ShareName失败:', e);
      setState((prev) => {
        const newState = { ...prev, lastError: errorMsg };
        console.log('状态更新(切换ShareName失败):', newState);
        return newState;
      });
      // 确保视图居中
      setTimeout(() => {
        const graph = graphRef.current;
        if (graph && typeof graph.fitView === 'function') {
          graph.fitView(30);
        }
      }, 100);
    }
  };

  // 复制路径
  const handleCopyPath = async () => {
    try {
      console.log('handleCopyPath');

      const base = '__FEDERATION__.__SHARE__';
      const segs: string[] = [];
      if (state.currentScope) {
        segs.push(`['${state.currentScope}']`);
      }
      if (state.currentShare) {
        segs.push(`['${state.currentShare}']`);
      }
      if (state.currentVersion) {
        segs.push(`['${state.currentVersion}']`);
      }
      const text = base + segs.join('');

      await navigator.clipboard.writeText(text);

      // 显示成功提示
      Message.success({
        content:
          '路径已复制到剪贴板！您可以在控制台粘贴此路径查看具体的 share 信息',
        duration: 3000,
      });
    } catch (e: unknown) {
      const errorMsg = `复制失败：${(e as Error)?.message}`;
      setState((prev) => ({ ...prev, lastError: errorMsg }));

      // 显示错误提示
      Message.error({
        content: errorMsg,
        duration: 3000,
      });
    }
  };

  // More按钮点击
  const handleMoreClick = () => {
    try {
      console.log('handleMoreClick');
      if (
        state.level !== 3 ||
        !state.currentScope ||
        !state.currentShare ||
        !state.currentVersion
      ) {
        return;
      }
      const info =
        state.normalized[state.currentScope][state.currentShare].versions[
          state.currentVersion
        ];
      const content = safeStringify(info, 2);
      setModalContent(content);
      setModalVisible(true);
    } catch (e: unknown) {
      const errorMsg = `More 弹窗展示失败：${(e as Error)?.message}`;
      setState((prev) => ({ ...prev, lastError: errorMsg }));
    }
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    console.log('handleCloseModal');

    setModalVisible(false);
  };

  // 生成面包屑
  const generateBreadcrumb = () => {
    const parts = [];
    parts.push(
      <span
        key="all"
        className={styles.crumb}
        onClick={() => handleBreadcrumbClick('all')}
      >
        全部
      </span>,
    );

    if (state.currentShare) {
      parts.push(<span key="sep1">›</span>);
      parts.push(
        <span
          key="share"
          className={styles.crumb}
          onClick={() =>
            handleBreadcrumbClick(
              'share',
              state.currentScope,
              state.currentShare,
            )
          }
        >
          {state.currentShare}
        </span>,
      );
    }

    if (state.currentVersion) {
      parts.push(<span key="sep2">›</span>);
      parts.push(
        <span
          key="version"
          className={styles.crumb}
          onClick={() =>
            handleBreadcrumbClick(
              'version',
              state.currentScope,
              state.currentShare,
              state.currentVersion,
            )
          }
        >
          {state.currentVersion}
        </span>,
      );
    }

    return parts;
  };

  // 获取ShareScope选项
  const getScopeOptions = () => {
    const scopes = Object.keys(state.normalized);
    return scopes;
  };

  // 获取ShareName选项
  const getShareNameOptions = () => {
    // 如果没有选择ShareScope，返回所有ShareName选项
    if (!state.currentScope) {
      const allShareNames: string[] = [];
      Object.keys(state.normalized).forEach((scope) => {
        const shareNames = Object.keys(state.normalized[scope] || {});
        allShareNames.push(...shareNames);
      });
      // 去重
      return [...new Set(allShareNames)];
    }

    const shareNames = Object.keys(state.normalized[state.currentScope] || {});
    return shareNames;
  };
  return (
    <div className={`${styles.appContainer} ${className || ''}`}>
      {/* 如果没有shareInfo数据，显示提示信息 */}
      {!shareInfo && (
        <div className={styles.noDataContainer}>
          <h2>No ShareInfo Detected</h2>
        </div>
      )}

      {/* 左侧主画布区域 */}
      <div
        className={styles.mainContent}
        style={{ display: shareInfo ? 'flex' : 'none' }}
      >
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.scopeSelector}>
              <label htmlFor="shareScope-select">ShareScope:</label>
              <select
                id="shareScope-select"
                value={state.currentScope || DEFAULT_SHARE_SCOPE}
                onChange={handleScopeChange}
              >
                <option value={DEFAULT_SHARE_SCOPE}>
                  {DEFAULT_SHARE_SCOPE}
                </option>
                {getScopeOptions()
                  .filter((scope) => scope !== DEFAULT_SHARE_SCOPE)
                  .map((scope) => (
                    <option key={scope} value={scope}>
                      {scope}
                    </option>
                  ))}
              </select>
            </div>
            <div className={styles.shareNameSelector}>
              <label htmlFor="shareName-select">ShareName:</label>
              <select
                id="shareName-select"
                value={state.currentShare || ''}
                onChange={handleShareNameChange}
              >
                <option value="">全部</option>
                {getShareNameOptions().map((shareName) => (
                  <option key={shareName} value={shareName}>
                    {shareName}
                  </option>
                ))}
              </select>
            </div>
            <nav className={styles.breadcrumbNav}>{generateBreadcrumb()}</nav>
          </div>
          <div className={styles.headerRight}>
            <button
              onClick={handleCopyPath}
              title="复制路径"
              className={styles.btn}
            >
              Copy Path
            </button>
            {state.level === 3 && (
              <button
                onClick={handleMoreClick}
                title="更多信息（第三级可用）"
                className={styles.btn}
              >
                More
              </button>
            )}
          </div>
        </header>
        <section
          id="graphContainer"
          ref={graphContainerRef}
          className={styles.graphContainer}
        >
          {errorMessage && (
            <div className={styles.errorContainer}>
              <div>
                <h2 className={styles.errorTitle}>Oops ! Something wrong...</h2>
                <p className={styles.errorMessage}>{errorMessage}</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 弹窗 */}
      {modalVisible && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>详细信息</h4>
              <button className={styles.modalClose} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalJson}>{modalContent}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareGraph;
