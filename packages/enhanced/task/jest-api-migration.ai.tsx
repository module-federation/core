import { Program, Agent, Prompt, Instructions } from '@unpack/ai';

export default (
  <Program
    id="jest-api-migration"
    target={{ language: 'markdown' }}
    description="Placeholder module to satisfy imports during incremental generation."
  >
    <Agent id="noop">
      <Prompt>
        <Instructions>
          No-op placeholder. This module will be replaced by the real
          jest-api-migration implementation.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);

