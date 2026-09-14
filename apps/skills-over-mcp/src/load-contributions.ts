import nodeRuntimePlugin from '@module-federation/node/runtimePlugin';
import { init } from '@module-federation/runtime';
import type {
  FederatedContributionModule,
  FederatedMcpContribution,
} from './contracts.ts';

const getContribution = (
  remoteName: string,
  remoteModule: FederatedContributionModule | null,
): FederatedMcpContribution => {
  const contribution = remoteModule?.contribution ?? remoteModule?.default;
  if (!contribution) {
    throw new Error(`${remoteName} did not expose an MCP contribution`);
  }
  return contribution;
};

export const loadFederatedContributions = async (
  providerOrigin: string,
): Promise<FederatedMcpContribution[]> => {
  const federation = init({
    name: 'skills_mcp_gateway',
    plugins: [nodeRuntimePlugin()],
    remotes: [
      {
        name: 'runtime_skills_provider',
        entry: `${providerOrigin}/runtime/mf-manifest.json`,
      },
      {
        name: 'delivery_skills_provider',
        entry: `${providerOrigin}/delivery/mf-manifest.json`,
      },
    ],
  });

  const [runtimeModule, deliveryModule] = await Promise.all([
    federation.loadRemote<FederatedContributionModule>(
      'runtime_skills_provider/contribution',
    ),
    federation.loadRemote<FederatedContributionModule>(
      'delivery_skills_provider/contribution',
    ),
  ]);

  return [
    getContribution('runtime_skills_provider', runtimeModule),
    getContribution('delivery_skills_provider', deliveryModule),
  ];
};
