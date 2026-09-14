import type { FederatedMcpContribution } from '../contracts.ts';
import { defineSkill } from '../define-skill.ts';

const providerId = 'delivery_skills_provider';
const buildVersion = '2026.09.14';

export const contribution: FederatedMcpContribution = {
  providerId,
  buildVersion,
  skills: [
    defineSkill({
      name: 'ship-federated-skill',
      description:
        'Ship a federated skill provider while preserving SEP-2640 integrity.',
      license: 'MIT',
      path: 'module-federation/delivery/ship-federated-skill',
      body: `# Ship a federated skill

1. Call \`inspect_skill_delivery\` to identify the loaded provider revision.
2. Read \`references/release-gate.md\`.
3. Deploy the remote under an immutable build URL.
4. Confirm that changed bytes produce changed SEP-2640 digests.`,
      supportingFiles: {
        'references/release-gate.md': {
          mimeType: 'text/markdown',
          text: `# Release gate

- The Module Federation manifest resolves to the intended remote build.
- The gateway hashes every skill file after loading the contribution.
- The MCP client observes the Skills extension capability.
- A stale digest prevents the host from using changed content.
`,
        },
      },
    }),
  ],
  tools: [
    {
      name: 'inspect_skill_delivery',
      description:
        'Return the trusted delivery provider identity and release policy.',
      async run() {
        return {
          providerId,
          buildVersion,
          remotePolicy: 'allowlisted-and-build-pinned',
        };
      },
    },
  ],
};

export default contribution;
