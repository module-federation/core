import { importRequest, plannedImports, type CompositionPlan } from './plan';
import type { CompositionImports } from './resolveImports';

const quote = (value: string) =>
  `'${JSON.stringify(value).slice(1, -1).replace(/'/g, "\\'")}'`;

export function renderComposition(
  plan: CompositionPlan,
  imports: CompositionImports,
  buildId?: string,
): string {
  const planned = plannedImports(plan);
  const lines = planned.map((entry) => {
    const request = importRequest(entry);
    const file = imports[request];
    if (file === undefined) throw new Error(`${request} was not resolved`);
    return `import { ${entry.binding} } from ${quote(file)};`;
  });
  const capabilities = planned
    .filter(({ slot }) => slot === 'capabilities')
    .map(({ binding, key }) => (key ? `${key}: ${binding}` : binding));
  const adapters = planned
    .filter(({ slot }) => slot === 'adapters')
    .map(({ binding }) => binding);

  lines.push('', 'var federation = createFederation({');
  if (buildId !== undefined) lines.push(`\tbuildId: ${quote(buildId)},`);
  lines.push(
    capabilities.length
      ? `\tcapabilities: { ${capabilities.join(', ')} },`
      : '\tcapabilities: {},',
    `\tadapters: [${adapters.join(', ')}],`,
    '});',
    'export default federation;',
    '',
  );
  return lines.join('\n');
}
