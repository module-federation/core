import { Program, Agent, Prompt, Instructions } from '@unpack/ai';

import './nx-targets.ai.tsx';
import './jest-api-migration.ai.tsx';
import './config-cases.ai.tsx';

export default (
  <Program
    id="remove-jest-infra"
    target={{ language: 'markdown' }}
    description="Placeholder module to satisfy imports during incremental generation."
  >
    <Agent id="noop">
      <Prompt>
        <Instructions>
          No-op placeholder. This module will be replaced by the real
          remove-jest-infra implementation.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);

