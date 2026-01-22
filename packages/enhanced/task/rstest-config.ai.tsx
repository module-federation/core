import { Program, Agent, Prompt, Instructions } from '@unpack/ai';

import './repo-scan.ai.tsx';

export default (
  <Program
    id="rstest-config"
    target={{ language: 'markdown' }}
    description="Placeholder module to satisfy imports during incremental generation."
  >
    <Agent id="noop">
      <Prompt>
        <Instructions>
          No-op placeholder. This module will be replaced by the real
          rstest-config implementation.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);

