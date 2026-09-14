import type { FederatedMcpContribution } from '../contracts.ts';
import { defineSkill } from '../define-skill.ts';

const providerId = 'runtime_skills_provider';
const buildVersion = '1.0.0';

export const contribution: FederatedMcpContribution = {
  providerId,
  buildVersion,
  skills: [
    defineSkill({
      name: 'diagnose-federation-runtime',
      description:
        'Diagnose a Module Federation runtime failure from live module evidence.',
      license: 'MIT',
      path: 'module-federation/runtime/diagnose-federation-runtime',
      body: `# Diagnose Federation runtime

1. Call \`inspect_federation_runtime\` before changing configuration.
2. Read \`references/checklist.md\`.
3. Separate remote resolution, container initialization, and exposed-module execution failures.
4. Report the provider build version with the diagnosis.`,
      supportingFiles: {
        'references/checklist.md': {
          mimeType: 'text/markdown',
          text: `# Runtime checklist

- Confirm the exact remote name and entry URL.
- Inspect the manifest before the remote entry.
- Record which exposed module failed.
- Compare the loaded share scope with the producer requirements.
`,
        },
      },
    }),
  ],
  tools: [
    {
      name: 'inspect_federation_runtime',
      description:
        'Return the trusted federated provider identity and its diagnostic phases.',
      async run() {
        return {
          providerId,
          buildVersion,
          phases: ['resolve-manifest', 'initialize-container', 'load-expose'],
        };
      },
    },
  ],
};

export default contribution;
