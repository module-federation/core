import { expect, describe, it } from 'vitest';

import { DependencyGraph } from '../src/utils/sdk/graph';

describe('DependencyGraph', () => {
  it('keeps the matched remote entry when the provider snapshot is missing', () => {
    const remoteEntry =
      'https://ad.oceanengine.com/copilot/vmok/ocean_copilot_sdk/vmok-manifest.json';
    const snapshot = {
      '@qianchuan-vmok/qc-copilot:https://qianchuan.jinritemai.com/vmok-modules/qc-copilot/manifest/vmok-manifest.json':
        {
          version:
            'https://qianchuan.jinritemai.com/vmok-modules/qc-copilot/manifest/vmok-manifest.json',
          remotesInfo: {
            '@ocean-copilot/sdk': {
              matchedVersion: remoteEntry,
            },
          },
        },
    } as any;
    const consumer =
      '@qianchuan-vmok/qc-copilot:https://qianchuan.jinritemai.com/vmok-modules/qc-copilot/manifest/vmok-manifest.json';
    const moduleGraph = new DependencyGraph(snapshot, consumer);

    moduleGraph.createGraph();
    moduleGraph.run(moduleGraph.graph, consumer, 'graphItem');

    const remoteNode = moduleGraph.node.find((node) =>
      node.data.info.startsWith('@ocean-copilot/sdk:'),
    );

    expect(remoteNode?.data.info).toBe(`@ocean-copilot/sdk:${remoteEntry}`);
  });

  it('keeps remote entry query parameters in node info', () => {
    const remoteEntry =
      'https://qianchuan.jinritemai.com/vmok-modules/qc-runtime/manifest/vmok-manifest.json?aavid=1689373886941197&from_qc_login=1';
    const snapshot = {
      '@qianchuan-vmok/qc-main-mono-home': {
        version: '0.0.4302',
        remotesInfo: {
          '@qianchuan-vmok/runtime-module': {
            matchedVersion: remoteEntry,
          },
        },
      },
    } as any;
    const moduleGraph = new DependencyGraph(
      snapshot,
      '@qianchuan-vmok/qc-main-mono-home',
    );

    moduleGraph.createGraph();
    moduleGraph.run(
      moduleGraph.graph,
      '@qianchuan-vmok/qc-main-mono-home',
      'graphItem',
    );

    const remoteNode = moduleGraph.node.find((node) =>
      node.data.info.startsWith('@qianchuan-vmok/runtime-module:'),
    );

    expect(remoteNode?.data.info).toBe(
      `@qianchuan-vmok/runtime-module:${remoteEntry}`,
    );
  });
});
