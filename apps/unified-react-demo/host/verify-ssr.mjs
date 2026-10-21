import assert from 'node:assert/strict';
const mode = process.argv[2] || 'manifest';
const response = await fetch('http://localhost:5101/');
assert.equal(response.status, 200);
const html = await response.text();
assert.equal(
  (html.match(/<article data-testid="plain"/g) || []).length,
  3,
  'id, loader and loader-priority plain components must be server rendered',
);
assert.equal(
  (html.match(/<article data-testid="data"/g) || []).length,
  2,
  'id and loader data components must be server rendered',
);
assert.ok(
  html.includes('Fetched on provider'),
  'SSR must contain fetched data',
);
assert.ok(
  !html.includes('MISSING DATA'),
  'SSR must not render data-less placeholders',
);
assert.ok(
  !html.includes('<article data-testid="app"'),
  'Bridge applications must remain client mounted',
);
assert.ok(!html.includes('role="alert"'), 'No server-side fallback');
assert.ok(html.includes(`data-source="${mode}"`), 'Expected metadata path');
if (mode === 'snapshot')
  assert.ok(
    html.includes('globalThis.__FEDERATION__.moduleInfo = Object.assign'),
    'Document must inject snapshot before client scripts',
  );
console.log(
  `PASS ${mode}: plain/data SSR, loader precedence, client-only apps and metadata source`,
);
