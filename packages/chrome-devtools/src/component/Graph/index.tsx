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
import GraphItem from '../GraphItem';
import { separateType } from '../../utils';

import styles from './index.module.scss';
import 'reactflow/dist/style.css';

const nodeWidth = 400;
const nodeHeight = 600;
const nodeTypes = { graphItem: GraphItem };

const Graph = (props: { snapshot: GlobalModuleInfo }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { snapshot } = props;
  const { moduleInfo } = window.__FEDERATION__;
  const { consumers } = separateType(moduleInfo);

  useEffect(() => {
    const dagreGraph = new dagre.graphlib.Graph();
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
        const nodeWithPosition = dagreGraph.node(node.id);
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
      <ReactFlow
        className={styles.graph}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView={true}
      >
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Graph;
