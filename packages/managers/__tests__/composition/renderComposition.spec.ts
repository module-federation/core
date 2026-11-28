import { planComposition } from '../../src/composition/plan';
import { renderComposition } from '../../src/composition/renderComposition';

const W = '/wbr/dist';
const C = '/core/dist';
const WBR = '@module-federation/webpack-bundler-runtime';
const CORE = '@module-federation/runtime-core';
const imports = {
  [`${WBR}/compose`]: `${W}/compose.js`,
  [`${WBR}/adapters/remotes`]: `${W}/adapters/remotes.js`,
  [`${WBR}/adapters/consumes`]: `${W}/adapters/consumes.js`,
  [`${WBR}/adapters/container`]: `${W}/adapters/container.js`,
  [`${WBR}/adapters/share-scope`]: `${W}/adapters/share-scope.js`,
  [`${CORE}/shared`]: `${C}/shared.js`,
  [`${CORE}/remote`]: `${C}/remote.js`,
  [`${CORE}/snapshot`]: `${C}/snapshot.js`,
  [`${CORE}/platform/web`]: `${C}/platform/web.js`,
  [`${CORE}/platform/node`]: `${C}/platform/node.js`,
  [`${CORE}/platform/universal`]: `${C}/platform/universal.js`,
};

describe('renderComposition', () => {
  it('renders a web host with remotes only', () => {
    const plan = planComposition(
      [
        {
          kind: 'options',
          disable: { shared: true, snapshot: true },
          needs: ['remotes'],
        },
      ],
      'web',
    );
    expect(renderComposition(plan, imports, 'host:1.0.0')).toBe(
      `import { createFederation } from '/wbr/dist/compose.js';
import { remotes } from '/wbr/dist/adapters/remotes.js';
import { shareScope } from '/wbr/dist/adapters/share-scope.js';
import { remote } from '/core/dist/remote.js';
import { web } from '/core/dist/platform/web.js';

var federation = createFederation({
\tbuildId: 'host:1.0.0',
\tcapabilities: { remote, platform: web },
\tadapters: [remotes, shareScope],
});
export default federation;
`,
    );
  });

  it('renders a remote that only exposes with no capabilities', () => {
    const plan = planComposition(
      [
        {
          kind: 'options',
          disable: { remote: true, shared: true },
          needs: ['container'],
        },
      ],
      'web',
    );
    expect(renderComposition(plan, imports, 'remote:1.0.0')).toBe(
      `import { createFederation } from '/wbr/dist/compose.js';
import { container } from '/wbr/dist/adapters/container.js';
import { shareScope } from '/wbr/dist/adapters/share-scope.js';

var federation = createFederation({
\tbuildId: 'remote:1.0.0',
\tcapabilities: {},
\tadapters: [container, shareScope],
});
export default federation;
`,
    );
  });

  it.each(['web', 'node', 'universal'] as const)(
    'keeps the %s platform for shared fallback entries when remotes are disabled',
    (platform) => {
      const plan = planComposition(
        [{ kind: 'options', disable: { remote: true }, needs: ['consumes'] }],
        platform,
      );

      const source = renderComposition(plan, imports, 'shared-host:1.0.0');

      expect(source).toContain(
        `import { ${platform} } from '/core/dist/platform/${platform}.js';`,
      );
      expect(source).toContain(
        `capabilities: { shared, platform: ${platform} }`,
      );
      expect(source).not.toContain("from '/core/dist/remote.js'");
      expect(source).not.toContain("from '/core/dist/snapshot.js'");
    },
  );

  it('renders a node host with remotes and shared', () => {
    const plan = planComposition(
      [{ kind: 'options', disable: {}, needs: ['remotes', 'consumes'] }],
      'node',
    );
    expect(renderComposition(plan, imports, 'server:1.0.0')).toBe(
      `import { createFederation } from '/wbr/dist/compose.js';
import { remotes } from '/wbr/dist/adapters/remotes.js';
import { consumes } from '/wbr/dist/adapters/consumes.js';
import { shareScope } from '/wbr/dist/adapters/share-scope.js';
import { shared } from '/core/dist/shared.js';
import { remote } from '/core/dist/remote.js';
import { snapshot } from '/core/dist/snapshot.js';
import { node } from '/core/dist/platform/node.js';

var federation = createFederation({
\tbuildId: 'server:1.0.0',
\tcapabilities: { shared, remote, snapshot, platform: node },
\tadapters: [remotes, consumes, shareScope],
});
export default federation;
`,
    );
  });

  it('omits buildId when none is given and escapes quoted strings', () => {
    const plan = planComposition(
      [{ kind: 'options', disable: { remote: true, shared: true }, needs: [] }],
      'web',
    );
    expect(
      renderComposition(plan, { [`${WBR}/compose`]: "/it's/compose.js" }),
    ).toBe(
      `import { createFederation } from '/it\\'s/compose.js';

var federation = createFederation({
\tcapabilities: {},
\tadapters: [],
});
export default federation;
`,
    );
  });

  it('throws when an import the plan needs was not resolved', () => {
    const { [`${CORE}/platform/universal`]: _, ...missingPlatform } = imports;
    expect(() =>
      renderComposition(planComposition([], 'universal'), missingPlatform),
    ).toThrow(`${CORE}/platform/universal`);
  });
});
