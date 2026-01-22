import { Program, Agent, Prompt, Instructions } from '@unpack/ai';

export default (
  <Program
    id="repo-scan"
    target={{ language: 'markdown' }}
    description="Placeholder module to satisfy imports during incremental generation."
  >
    <Agent id="noop">
      <Prompt>
        <Instructions>
          No-op placeholder. This module will be replaced by the real repo-scan
          implementation.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);

