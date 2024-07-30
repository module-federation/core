import { ConsumerModuleInfo, GlobalModuleInfo } from '@module-federation/sdk';
import { MarkerType } from 'reactflow';

export interface NodeCustomData {
  info: string;
  color: string;
  [key: string]: any;
}

export interface NodeType {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: NodeCustomData;
}

export type Edge = 'default' | 'straight' | 'step' | 'smoothstep' | 'bezier';

export interface EdgeType {
  id: string;
  source: string;
  target: string;
  type: Edge;
  markerEnd: {
    type: MarkerType;
    width: number;
    height: number;
  };
}

export const validateSemver = (schema: string) => {
  // https://regex101.com/r/vkijKf/1
  const reg =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(\.(0|[1-9]\d*))?(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm;
  return reg.test(schema);
};

export const validatePort = (schema: string) => !isNaN(Number(schema));

const splitModuleId = (target: string) => {
  const array = target.split(':');
  const { length } = array;
  if (length === 1) {
    return target;
  } else if (length >= 3) {
    // @xxx:https://xxx.xxx.json
    if (
      array[length - 1].endsWith('.json') ||
      array[length - 1].endsWith('.js')
    ) {
      const idx = array.findIndex((t) => t.startsWith('http'));
      return array[idx - 1];
    } else {
      // type:@xxx:https://xxx.xxx.json
      return array[1];
    }
  } else {
    const nameOrVersion = array[length - 1];
    if (
      nameOrVersion === '*' ||
      nameOrVersion === 'latest' ||
      validateSemver(nameOrVersion)
    ) {
      return array[0];
    } else {
      return nameOrVersion;
    }
  }
};

export class DependencyGraph {
  public snapshot: GlobalModuleInfo;

  public initTarget: string;

  public node: Array<NodeType>;

  public edge: Array<EdgeType>;

  public graph: any;

  public identifyMap: Map<string, string>;

  public handledModuleMap: Map<string, boolean>;

  constructor(snapshot: GlobalModuleInfo, initTarget: string) {
    this.snapshot = snapshot;
    this.initTarget = initTarget;
    this.node = [];
    this.edge = [];
    this.graph = {};
    this.identifyMap = new Map();
    this.handledModuleMap = new Map();
  }

  createGraph(target: string = this.initTarget) {
    const { snapshot } = this;

    let remotesInfo: ConsumerModuleInfo['remotesInfo'] | undefined;
    const snapshotWithoutType = snapshot[target];
    const snapshotWithType = snapshot[target];
    if (snapshotWithoutType && 'remotesInfo' in snapshotWithoutType) {
      remotesInfo = snapshotWithoutType?.remotesInfo;
    }
    if (snapshotWithType && 'remotesInfo' in snapshotWithType) {
      remotesInfo = snapshotWithType?.remotesInfo;
    }

    if (!remotesInfo) {
      return;
    }

    Object.keys(remotesInfo).forEach((dep) => {
      const { matchedVersion } = remotesInfo![dep];
      let childId = dep;
      if (matchedVersion && matchedVersion !== '') {
        childId = `${childId}:${matchedVersion}`;
      }

      if (!this.graph[target]) {
        this.graph[target] = {};
      }
      this.graph[childId] = {};
      this.graph[target][childId] = this.graph[childId];

      const handled = this.handledModuleMap.get(childId);
      if (!handled) {
        this.handledModuleMap.set(childId, true);
        this.createGraph(childId);
      }
    });
  }

  addNode(
    id: string,
    type: string,
    x: number,
    y: number,
    nodeData: NodeCustomData,
  ) {
    this.node.push({
      id,
      type,
      position: {
        x,
        y,
      },
      data: {
        ...nodeData,
      },
    });
  }

  addEdge(id: string, source: string, target: string, type: Edge = 'default') {
    this.edge.push({
      id,
      source,
      target,
      markerEnd: {
        type: MarkerType.Arrow,
        width: 30,
        height: 30,
      },
      type,
    });
  }

  run(
    targetGraph: any,
    target: string = this.initTarget,
    type: string,
    id: string = this.initTarget,
  ) {
    if (!targetGraph || !Object.keys(targetGraph)?.length) {
      return;
    }
    const name = splitModuleId(target);
    const targetWithoutType = name;
    let info = name;

    const remote = this.snapshot[target];
    if (remote && ('version' in remote || 'remoteEntry' in remote)) {
      // @ts-expect-error
      info += `:${remote.version || remote.remoteEntry}`;
    }

    if (!this.identifyMap.has(targetWithoutType)) {
      this.identifyMap.set(targetWithoutType, this.identify());
    }

    this.addNode(id, type, 0, 0, {
      info,
      remote,
      color: this.identifyMap.get(targetWithoutType) as string,
    });

    const graphChilden = Object.keys(
      targetGraph[targetWithoutType] || targetGraph[target] || {},
    );

    graphChilden.forEach((dep) => {
      this.addEdge(id + dep, id, id + dep);
      this.run(
        targetGraph[targetWithoutType] || targetGraph[target],
        dep,
        type,
        id + dep,
      );
    });
  }

  identify() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    const color = `rgba(${r},${g},${b},0.8)`;

    return color;
  }
}
