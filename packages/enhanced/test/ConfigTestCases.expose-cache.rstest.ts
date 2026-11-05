import { describeCases } from './ConfigTestCases.rstest';

describeCases({
  name: 'ConfigTestCases-expose-cache',
  includeCategories: ['layers'],
  includeTests: ['expose-layer-options'],
  cache: { type: 'filesystem' },
});
