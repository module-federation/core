import { Program, Agent, Prompt, Instructions } from '@unpack/ai';

import './repo-scan.ai.tsx';
import './rstest-config.ai.tsx';

export default (
  <Program
    id="tsconfig-spec"
    target={{ language: 'markdown' }}
    description="Placeholder module to satisfy imports during incremental generation."
  >
    <Agent id="noop">
      <Prompt>
        <Instructions>
          No-op placeholder. This module will be replaced by the real
          tsconfig-spec implementation.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);

