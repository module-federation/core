import { useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Controls,
  Node,
  Edge,
  Connection,
} from 'reactflow';
import dagre from 'dagre';
import { GlobalModuleInfo } from '@module-federation/sdk';

import { DependencyGraph } from '../../utils/sdk/graph';
import GraphItem from '../DependencyGraphItem';
import { separateType } from '../../utils';

import styles from './index.module.scss';
import 'reactflow/dist/style.css';

const nodeWidth = 360;
const nodeHeight = 420;
const nodeTypes = { graphItem: GraphItem };

const Graph = (props: { snapshot: GlobalModuleInfo }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { snapshot } = props;
  const federation = window.__FEDERATION__ || {
    moduleInfo: {} as GlobalModuleInfo,
    originModuleInfo: {} as GlobalModuleInfo,
  };
  const { moduleInfo } = federation;
  const { consumers } = separateType(moduleInfo);

  useEffect(() => {
    const dagreGraph = new dagre.graphlib.Graph();
    // @ts-expect-error
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const getLayoutedElements = (
      nodes: Array<Node>,
      edges: Array<Edge>,
      direction = 'TB',
    ) => {
      dagreGraph.setGraph({ rankdir: direction });

      nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      });

      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      dagre.layout(dagreGraph);

      nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id) as {
          x: number;
          y: number;
        };
        node.position = {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        };
      });

      return { nodes, edges };
    };

    let nodeSet: Array<Node> = [];
    let edgeSet: Array<Edge> = [];
    for (const consumer in consumers) {
      const moduleGraph = new DependencyGraph(snapshot, consumer);
      moduleGraph.createGraph();
      moduleGraph.run(moduleGraph.graph, consumer, 'graphItem');
      nodeSet = [...nodeSet, ...moduleGraph.node];
      edgeSet = [...edgeSet, ...moduleGraph.edge];
    }

    if (!nodeSet.length) {
      nodeSet.push({
        id: '1',
        type: 'graphItem',
        position: {
          x: 0,
          y: 0,
        },
        data: {
          color: 'lightgreen',
        },
      });
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodeSet,
      edgeSet,
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // fit view
    setTimeout(() => {
      const element = document.getElementsByClassName(
        'react-flow__controls-fitview',
      )[0];
      // @ts-expect-error
      element?.click();
    }, 50);
  }, [snapshot]);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds,
        ),
      ),
    [],
  );

  return (
    <div className={styles.depWrapper}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <span className={styles.title}>Dependency Graph</span>
          <span className={styles.subtitle}>
            Visualise how consumers resolve remotes with the current overrides.
          </span>
        </div>
        <div className={styles.meta}>
          <span className={styles.metaBadge}>{nodes.length}</span>
          <span className={styles.metaLabel}>
            {nodes.length === 1 ? 'node rendered' : 'nodes rendered'}
          </span>
        </div>
      </div>

      <div className={styles.canvas}>
        <ReactFlow
          className={styles.graph}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          fitView={true}
        >
          <Controls className={styles.controls} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default Graph;
